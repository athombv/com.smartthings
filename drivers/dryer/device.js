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
      smartThingsCapabilityId: 'samsungce.dryerOperatingState',
      smartThingsAttributeId: 'remainingTimeStr',
      async onReport({ value }) {
        return value;
      },
    },
    {
      homeyCapabilityId: 'samsung_dryer_current_job_state',
      smartThingsComponentId: 'main',
      smartThingsCapabilityId: 'samsungce.dryerOperatingState',
      smartThingsAttributeId: 'dryerJobState',
      async onReport({ value }) {
        const homeyCapabilityId = 'samsung_dryer_current_job_state';

        const flowArray = [
          {
            value: 'finished',
            flow: 'samsung_dryer_job_finished',
          },
          {
            value: 'drying',
            flow: 'samsung_dryer_job_started',
          },
          {
            value: 'spin',
            flow: 'samsung_dryer_job_spin',
          },
          {
            value: 'rinse',
            flow: 'samsung_dryer_job_rinse',
          },
        ];

        flowArray.forEach(f => {
          if (value === f.value && this.getCapabilityValue(homeyCapabilityId) !== f.value) {
            this.homey.flow
              .getDeviceTriggerCard(f.flow)
              .trigger(this)
              .catch(this.error);
          }
        });

        return value;
      },
    },
  ];  
};
