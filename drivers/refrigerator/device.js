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
      smartThingsComponentId: 'cooler',
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

  // Flow conditions
  async rapidFreezeState({ state }) {
    const value = this.getCapabilityValue('samsung_refrigerator_rapid_freeze');
    return (state === 'on') ? value : !value;
  }

  async rapidCoolState({ state }) {
    const value = this.getCapabilityValue('samsung_refrigerator_rapid_cool');
    return (state === 'on') ? value : !value;
  }

  async onOAuth2Init() {
    this.homey.flow.getConditionCard('rapid_freeze_state')
      .registerRunListener(args => this.rapidFreezeState(args));
    this.homey.flow.getConditionCard('rapid_cool_state')
      .registerRunListener(args => this.rapidCoolState(args));
  }

  onInit() {
    super.onInit?.();

    this.homey.flow.getActionCard('set_rapid_freeze')
      .registerRunListener(async args => {
        await this.executeCommand({
          component: 'main',
          capability: 'refrigeration',
          command: 'setRapidFreezing',
          args: [args.state === 'on' ? 'on' : 'off'],
        });
        return true;
      });
    this.homey.flow.getActionCard('set_rapid_cool')
      .registerRunListener(async args => {
        await this.executeCommand({
          component: 'main',
          capability: 'refrigeration',
          command: 'setRapidCooling',
          args: [args.state === 'on' ? 'on' : 'off'],
        });
        return true;
      });
  }

};
