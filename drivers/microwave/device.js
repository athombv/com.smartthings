'use strict';

const SmartThingsDevice = require('../../lib/SmartThingsDevice');

module.exports = class SmartThingsDeviceMicrowave extends SmartThingsDevice {

  static CAPABILITIES = [
    {
      homeyCapabilityId: 'alarm_contact',
      smartThingsComponentId: 'main',
      smartThingsCapabilityId: 'samsungce.doorState',
      smartThingsAttributeId: 'doorState',
      async onReport({ value }) {
        if (value === 'open') return true;
        if (value === 'closed') return false;
        return null;
      },
    },
    {
      homeyCapabilityId: 'measure_temperature',
      smartThingsComponentId: 'main',
      smartThingsCapabilityId: 'temperatureMeasurement',
      smartThingsAttributeId: 'temperature',
      async onReport({ value }) {
        return value;
      },
    },
    {
      homeyCapabilityId: 'measure_temperature.target',
      smartThingsComponentId: 'main',
      smartThingsCapabilityId: 'ovenSetpoint',
      smartThingsAttributeId: 'ovenSetpoint',
      async onReport({ value }) {
        return value;
      },
    },
    {
      homeyCapabilityId: 'samsung_microwave_current_job_state',
      smartThingsComponentId: 'main',
      smartThingsCapabilityId: 'samsungce.ovenOperatingState',
      smartThingsAttributeId: 'ovenJobState',
      async onReport({ value }) {
        if (value === 'finished') {
          this.homey.flow
            .getDeviceTriggerCard('samsung_microwave_job_finished')
            .trigger(this)
            .catch(this.error);
        }

        return value;
      },
    },
    {
      homeyCapabilityId: 'samsung_microwave_progress_percentage',
      smartThingsComponentId: 'main',
      smartThingsCapabilityId: 'samsungce.ovenOperatingState',
      smartThingsAttributeId: 'progress',
      async onReport({ value }) {
        return value;
      },
    },
    {
      homeyCapabilityId: 'samsung_microwave_power_level',
      smartThingsComponentId: 'main',
      smartThingsCapabilityId: 'samsungce.microwavePower',
      smartThingsAttributeId: 'powerLevel',
      async onReport({ value }) {
        return value;
      },
    },
    {
      homeyCapabilityId: 'samsung_microwave_mode',
      smartThingsComponentId: 'main',
      smartThingsCapabilityId: 'samsungce.ovenMode',
      smartThingsAttributeId: 'ovenMode',
      async onReport({ value }) {
        if (value === 'NoOperation') return null;
        return value;
      },
    },
  ];

};
