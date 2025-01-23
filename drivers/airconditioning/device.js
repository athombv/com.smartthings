'use strict';

const SmartThingsDevice = require('../../lib/SmartThingsDevice');

module.exports = class SmartThingsDeviceAirconditioning extends SmartThingsDevice {

  static CAPABILITIES = [
    {
      homeyCapabilityId: 'onoff',
      smartThingsComponentId: 'main',
      smartThingsCapabilityId: 'switch',
      smartThingsAttributeId: 'switch',
      async onSet({ value }) {
        await this.executeCommand({
          component: 'main',
          capability: 'switch',
          command: value
            ? 'on'
            : 'off',
        });
      },
      async onReport({ value }) {
        return value === 'on';
      },
    },
    {
      homeyCapabilityId: 'measure_temperature',
      smartThingsComponentId: 'main',
      smartThingsCapabilityId: 'temperatureMeasurement',
      smartThingsAttributeId: 'temperature',
    },
    {
      homeyCapabilityId: 'measure_humidity',
      smartThingsComponentId: 'main',
      smartThingsCapabilityId: 'relativeHumidityMeasurement',
      smartThingsAttributeId: 'humidity',
    },
    {
      homeyCapabilityId: 'target_temperature',
      smartThingsComponentId: 'main',
      smartThingsCapabilityId: 'thermostatCoolingSetpoint',
      smartThingsAttributeId: 'coolingSetpoint',
      async onSet({ value }) {
        await this.executeCommand({
          component: 'main',
          capability: 'thermostatCoolingSetpoint',
          command: 'setCoolingSetpoint',
          args: [value],
        });
      },
      async onReport({ value }) {
        return value;
      },
    },
    {
      homeyCapabilityId: 'samsung_airconditioning_mode',
      smartThingsComponentId: 'main',
      smartThingsCapabilityId: 'airConditionerMode',
      smartThingsAttributeId: 'airConditionerMode',
      async onSet({ value }) {
        await this.executeCommand({
          component: 'main',
          capability: 'airConditionerMode',
          command: 'setAirConditionerMode',
          args: [value],
        });
      },
      async onReport({ value }) {
        this.homey.flow
          .getDeviceTriggerCard('samsung_airconditioning_mode_changed')
          .trigger(this, { mode: value })
          .catch(this.error);

        return value;
      },
    },
    {
      homeyCapabilityId: 'samsung_airconditioning_fan_mode',
      smartThingsComponentId: 'main',
      smartThingsCapabilityId: 'airConditionerFanMode',
      smartThingsAttributeId: 'fanMode',
      async onSet({ value }) {
        await this.executeCommand({
          component: 'main',
          capability: 'airConditionerFanMode',
          command: 'setFanMode',
          args: [value],
        });
      },
      async onReport({ value }) {
        this.log('Fan mode report: ', value);

        this.homey.flow
          .getDeviceTriggerCard('samsung_airconditioning_fan_mode_changed')
          .trigger(this, { fan_mode: value })
          .catch(this.error);

        return value;
      },
    },
    {
      homeyCapabilityId: 'samsung_airconditioning_fan_oscillation_mode',
      smartThingsComponentId: 'main',
      smartThingsCapabilityId: 'fanOscillationMode',
      smartThingsAttributeId: 'fanOscillationMode',
      async onSet({ value }) {
        await this.executeCommand({
          component: 'main',
          capability: 'fanOscillationMode',
          command: 'setFanOscillationMode',
          args: [value],
        });
      },
      async onReport({ value }) {
        this.homey.flow
          .getDeviceTriggerCard('samsung_airconditioning_fan_oscillation_mode_changed')
          .trigger(this, { fan_oscillation_mode: value })
          .catch(this.error);

        return value;
      },
    },
  ];

};
