'use strict';

const SmartThingsDevice = require('../../lib/SmartThingsDevice');

module.exports = class SmartThingsDeviceDishwasher extends SmartThingsDevice {

  static CAPABILITIES = [
    {
      homeyCapabilityId: 'samsung_dishwasher_status_job',
      smartThingsComponentId: 'main',
      smartThingsCapabilityId: 'dishwasherOperatingState',
      smartThingsAttributeId: 'dishwasherJobState',
      async onReport({ value }) {
        if (value === 'finished') {
          this.homey.flow
            .getDeviceTriggerCard('samsung_dishwasher_job_finished')
            .trigger(this)
            .catch(this.error);
        }

        return value;
      },
    },
  ];

};
