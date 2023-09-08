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
  ];

};
