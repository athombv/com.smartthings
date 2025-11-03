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
        const homeyCapabilityId = 'samsung_dishwasher_washing_course';
        const previousValue = this.getCapabilityValue(homeyCapabilityId);

        if (previousValue !== value) {
          this.homey.flow
            .getDeviceTriggerCard('samsung_dishwasher_washing_course_changed')
            .trigger(this, { value })
            .catch(this.error);
        }

        return value;
      },
    },
    {
      homeyCapabilityId: 'samsung_dishwasher_current_job_state',
      smartThingsComponentId: 'main',
      smartThingsCapabilityId: 'samsungce.dishwasherJobState',
      smartThingsAttributeId: 'dishwasherJobState',
      async onReport({ value }) {
        const homeyCapabilityId = 'samsung_dishwasher_current_job_state';
        const previousValue = this.getCapabilityValue(homeyCapabilityId);

        if (previousValue !== value) {
          this.homey.flow
            .getDeviceTriggerCard('samsung_dishwasher_current_job_state_changed')
            .trigger(this, { value })
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
        let newValue = null;

        if (value === 'open') newValue = true;
        if (value === 'closed') newValue = false;

        return newValue;
      },
    },
    {
      homeyCapabilityId: 'samsung_dishwasher_remote_controller_enabled',
      smartThingsComponentId: 'main',
      smartThingsCapabilityId: 'remoteControlStatus',
      smartThingsAttributeId: 'remoteControlEnabled',
      async onReport({ value }) {
        let newValue = null;

        if (value === 'true') newValue = true;
        if (value === 'false') newValue = false;

        if (newValue !== null) {
          const homeyCapabilityId = 'samsung_dishwasher_remote_controller_enabled';
          const previousValue = this.getCapabilityValue(homeyCapabilityId);

          if (newValue === true && previousValue !== true) {
            this.homey.flow
              .getDeviceTriggerCard('samsung_dishwasher_remote_controller_enabled_true')
              .trigger(this)
              .catch(this.error);
          } else if (newValue === false && previousValue !== false) {
            this.homey.flow
              .getDeviceTriggerCard('samsung_dishwasher_remote_controller_enabled_false')
              .trigger(this)
              .catch(this.error);
          }
        }

        return newValue;
      },
    },
  ];

};
