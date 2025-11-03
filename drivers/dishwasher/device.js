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
            .trigger(this, { washing_course: value })
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

        if (value === 'finished' && previousValue !== 'finished') {
          this.homey.flow
            .getDeviceTriggerCard('samsung_dishwasher_job_finished')
            .trigger(this)
            .catch(this.error);
        }

        if (previousValue !== value) {
          this.homey.flow
            .getDeviceTriggerCard('samsung_dishwasher_current_job_state_changed')
            .trigger(this, { job_state: value })
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

        if (newValue !== null) {
          const homeyCapabilityId = 'alarm_contact.dishwasher_door';
          const previousValue = this.getCapabilityValue(homeyCapabilityId);

          if (previousValue !== newValue) {
            this.homey.flow
              .getDeviceTriggerCard('alarm_contact_dishwasher_door_changed')
              .trigger(this, { door_open: newValue })
              .catch(this.error);
          }
        }

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

          if (previousValue !== newValue) {
            this.homey.flow
              .getDeviceTriggerCard('samsung_dishwasher_remote_controller_enabled_changed')
              .trigger(this, { remote_control_enabled: newValue })
              .catch(this.error);
          }
        }

        return newValue;
      },
    },
  ];

};
