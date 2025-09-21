'use strict';

const SmartThingsDevice = require('../../lib/SmartThingsDevice');

module.exports = class SmartThingsDeviceRefrigerator extends SmartThingsDevice {

  static CAPABILITIES = [
    {
      homeyCapabilityId: 'measure_temperature.cooler',
      smartThingsComponentId: 'cooler',
      smartThingsCapabilityId: 'temperatureMeasurement',
      smartThingsAttributeId: 'temperature',
    },
    {
      homeyCapabilityId: 'measure_temperature.freezer',
      smartThingsComponentId: 'freezer',
      smartThingsCapabilityId: 'temperatureMeasurement',
      smartThingsAttributeId: 'temperature',
    },
    {
      homeyCapabilityId: 'alarm_contact',
      smartThingsComponentId: 'main',
      smartThingsCapabilityId: 'contactSensor',
      smartThingsAttributeId: 'contact',
      async onReport({ value }) {
        return value === 'open';
      },
    },
    {
      homeyCapabilityId: 'samsung_refrigerator_rapid_cool',
      smartThingsComponentId: 'main',
      smartThingsCapabilityId: 'refrigeration',
      smartThingsAttributeId: 'rapidCooling',
      async onReport({ value }) {
        return value === 'on';
      },
    },
    {
      homeyCapabilityId: 'samsung_refrigerator_rapid_freeze',
      smartThingsComponentId: 'main',
      smartThingsCapabilityId: 'refrigeration',
      smartThingsAttributeId: 'rapidFreezing',
      async onReport({ value }) {
        return value === 'on';
      },
    },
  ];

  static FLOW = {
    conditions: {
      rapid_freeze_state: 'rapidFreezeState',
      rapid_cool_state: 'rapidCoolState',
    },
    actions: {
      set_rapid_freeze: 'setRapidFreeze',
      set_rapid_cool: 'setRapidCool',
    },
  };

  async rapidFreezeState({ state }) {
    const value = this.getCapabilityValue('samsung_refrigerator_rapid_freeze');
    return (state === 'on') ? value : !value;
  }

  async rapidCoolState({ state }) {
    const value = this.getCapabilityValue('samsung_refrigerator_rapid_cool');
    return (state === 'on') ? value : !value;
  }

  async setRapidFreeze({ state }) {
    await this.executeCommand({
      component: 'main',
      capability: 'refrigeration',
      command: 'setRapidFreezing',
      args: [state === 'on' ? 'on' : 'off'],
    });
    await this.setCapabilityValue('samsung_refrigerator_rapid_freeze', state === 'on');
  }

  async setRapidCool({ state }) {
    await this.executeCommand({
      component: 'main',
      capability: 'refrigeration',
      command: 'setRapidCooling',
      args: [state === 'on' ? 'on' : 'off'],
    });
    await this.setCapabilityValue('samsung_refrigerator_rapid_cool', state === 'on');
  }

  async onOAuth2Init() {
    this.homey.flow.getConditionCard('rapid_freeze_state')
      .registerRunListener(args => this.rapidFreezeState(args));
    this.homey.flow.getConditionCard('rapid_cool_state')
      .registerRunListener(args => this.rapidCoolState(args));
    if (super.onOAuth2Init) await super.onOAuth2Init();
  }

  onInit() {
    super.onInit?.();

    // Zorg dat alle capabilities aanwezig zijn op het apparaat
    for (const cap of this.constructor.CAPABILITIES) {
      if (!this.hasCapability(cap.homeyCapabilityId)) {
        this.addCapability(cap.homeyCapabilityId).catch(this.error);
      }
    }

    this.homey.flow.getActionCard('set_rapid_freeze')
      .registerRunListener(async args => {
        await this.setRapidFreeze(args);
        return true;
      });
    this.homey.flow.getActionCard('set_rapid_cool')
      .registerRunListener(async args => {
        await this.setRapidCool(args);
        return true;
      });
  }

};
