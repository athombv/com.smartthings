'use strict';

const SmartThingsDevice = require('../../lib/SmartThingsDevice');

module.exports = class SmartThingsDeviceDryer extends SmartThingsDevice {

  static CAPABILITIES = [
    {
      homeyCapabilityId: 'samsung_dryer_progress_percentage',
      smartThingsComponentId: 'main',
      smartThingsCapabilityId: 'samsungce.dryerOperatingState',
      smartThingsAttributeId: 'progress',
      async onReport({ value }) {
        return value;
      },
    },
    {
      homeyCapabilityId: 'samsung_dryer_progress_remaining_time',
      smartThingsComponentId: 'main',
      smartThingsCapabilityId: 'samsungce.washerOperatingState',
      smartThingsAttributeId: 'remainingTimeStr',
      async onReport({ value }) {
        return value;
      },
    },
    {
      homeyCapabilityId: 'samsung_dryer_current_job_state',
      smartThingsComponentId: 'main',
      smartThingsCapabilityId: 'samsungce.dryerOperatingState',
      smartThingsAttributeId: 'washerJobState',
      async onReport({ value }) {
        if (value === 'finished') {
          this.homey.flow
            .getDeviceTriggerCard('samsung_dryer_job_finished')
            .trigger(this)
            .catch(this.error);
        }

        return value;
      },
    },
  ];

};
