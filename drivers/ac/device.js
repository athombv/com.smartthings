'use strict';

const SmartThingsDevice = require('../../lib/SmartThingsDevice');

module.exports = class SmartThingsDeviceAC extends SmartThingsDevice {

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
        async onReport({ value }) {
          return value;
        },
      },
      {
        homeyCapabilityId: 'measure_humidity',
        smartThingsComponentId: 'main',
        smartThingsCapabilityId: 'relativeHumidityMeasurement',
        smartThingsAttributeId: 'humidity',
        async onReport({ value }) {
          return value;
        },
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
        homeyCapabilityId: 'samsung_ac_mode',
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
          return value;
        },
      },
      {
        homeyCapabilityId: 'samsung_ac_fan_mode',
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
          return value;
        },
      },
      {
        homeyCapabilityId: 'samsung_ac_fan_oscillation_mode',
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
          return value;
        },
      },
    ];

};
