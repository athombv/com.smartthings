'use strict';

const SmartThingsDevice = require('../../lib/SmartThingsDevice');

module.exports = class SmartThingsDeviceRobotVacuum extends SmartThingsDevice {

  static CAPABILITIES = [
    {
      homeyCapabilityId: 'measure_battery',
      smartThingsComponentId: 'main',
      smartThingsCapabilityId: 'battery',
      smartThingsAttributeId: 'battery',
      async onReport({ value }) {
        return value; // TODO
      },
    }
  ];

};
