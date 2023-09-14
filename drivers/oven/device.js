'use strict';

const SmartThingsDevice = require('../../lib/SmartThingsDevice');

module.exports = class SmartThingsDeviceOven extends SmartThingsDevice {

  static CAPABILITIES = [
    {
      homeyCapabilityId: 'samsung_oven_current_job_state',
      smartThingsComponentId: 'main',
      smartThingsCapabilityId: 'samsungce.OvenOperatingState',
      smartThingsAttributeId: 'MachineState',
      async onReport({ value }) {
        return value;
      },
    },
  ];

};
