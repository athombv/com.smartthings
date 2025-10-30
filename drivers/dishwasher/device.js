'use strict';

const SmartThingsDevice = require('../../lib/SmartThingsDevice');

module.exports = class SmartThingsDeviceDishwasher extends SmartThingsDevice {

  static CAPABILITIES = [
    {
      homeyCapabilityId: 'samsung_dishwasher_washing_course',
      smartThingsComponentId: 'main',
      smartThingsCapabilityId: 'samsungce.dishwasherWashingCourse',
      smartThingsAttributeId: 'washingCourse',
      async onReport({ value }) {
        return value;
      },
    },
    {
      homeyCapabilityId: 'samsung_dishwasher_current_job_state',
      smartThingsComponentId: 'main',
      smartThingsCapabilityId: 'samsungce.dishwasherJobState',
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
    {
      homeyCapabilityId: 'alarm_contact.dishwasher_door',
      smartThingsComponentId: 'onedoor',
      smartThingsCapabilityId: 'contactSensor',
      smartThingsAttributeId: 'contact',
      async onReport({ value }) {
        if (value === 'open') return true;
        if (value === 'closed') return false;
        return null;
      },
    },
    {
      homeyCapabilityId: 'samsung_dishwasher_remote_controller_enabled',
      smartThingsComponentId: 'main',
      smartThingsCapabilityId: 'remoteControlStatus',
      smartThingsAttributeId: 'remoteControlEnabled',
      async onReport({ value }) {
        if (value === 'true') return true;
        if (value === 'false') return false;
        return null;
      },
    },
  ];

};
