'use strict';

const SmartThingsDevice = require('../../lib/SmartThingsDevice');

module.exports = class SmartThingsDeviceRefrigerator extends SmartThingsDevice {

  static CAPABILITIES = [
    // Power (W)
    {
      homeyCapabilityId: 'measure_power',
      smartThingsComponentId: 'main',
      smartThingsCapabilityId: 'powerConsumptionReport',
      smartThingsAttributeId: 'powerConsumption',
      async onReport({ value }) {
        return this.constructor.getPowerConsumptionValue(value, 'power');
      },
    },
    // Energy (kWh) — powerConsumption.energy is in Wh
    {
      homeyCapabilityId: 'meter_power',
      smartThingsComponentId: 'main',
      smartThingsCapabilityId: 'powerConsumptionReport',
      smartThingsAttributeId: 'powerConsumption',
      async onReport({ value }) {
        return this.constructor.getPowerConsumptionValue(value, 'energy', 1000);
      },
    },
    {
      homeyCapabilityId: 'measure_temperature.cooler',
      smartThingsComponentId: 'cooler',
      smartThingsCapabilityId: 'temperatureMeasurement',
      smartThingsAttributeId: 'temperature',
    },
    {
      homeyCapabilityId: 'target_temperature.cooler',
      smartThingsComponentId: 'cooler',
      smartThingsCapabilityId: 'thermostatCoolingSetpoint',
      smartThingsAttributeId: 'coolingSetpoint',
      async onSet({ value }) {
        await this.executeCommand({
          component: 'cooler',
          capability: 'thermostatCoolingSetpoint',
          command: 'setCoolingSetpoint',
          args: [value],
        });
      },
    },
    {
      homeyCapabilityId: 'measure_temperature.freezer',
      smartThingsComponentId: 'freezer',
      smartThingsCapabilityId: 'temperatureMeasurement',
      smartThingsAttributeId: 'temperature',
    },
    {
      homeyCapabilityId: 'target_temperature.freezer',
      smartThingsComponentId: 'freezer',
      smartThingsCapabilityId: 'thermostatCoolingSetpoint',
      smartThingsAttributeId: 'coolingSetpoint',
      async onSet({ value }) {
        await this.executeCommand({
          component: 'freezer',
          capability: 'thermostatCoolingSetpoint',
          command: 'setCoolingSetpoint',
          args: [value],
        });
      },
    },
    {
      homeyCapabilityId: 'alarm_contact',
      smartThingsComponentId: 'cooler',
      smartThingsCapabilityId: 'contactSensor',
      smartThingsAttributeId: 'contact',
      async onReport({ value }) {
        return this.constructor.getBooleanFromOpenClosed(value);
      },
    },
    {
      homeyCapabilityId: 'alarm_contact.freezer',
      smartThingsComponentId: 'freezer',
      smartThingsCapabilityId: 'contactSensor',
      smartThingsAttributeId: 'contact',
      async onReport({ value }) {
        return this.constructor.getBooleanFromOpenClosed(value);
      },
    },
    {
      homeyCapabilityId: 'onoff.icemaker',
      smartThingsComponentId: 'icemaker',
      smartThingsCapabilityId: 'switch',
      smartThingsAttributeId: 'switch',
      async onSet({ value }) {
        await this.executeCommand({
          component: 'icemaker',
          capability: 'switch',
          command: value ? 'on' : 'off',
        });
      },
      async onReport({ value }) {
        return this.constructor.getBooleanFromOnOff(value);
      },
    },
  ];

};
