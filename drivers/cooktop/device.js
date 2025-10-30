'use strict';

const SmartThingsDevice = require('../../lib/SmartThingsDevice');

module.exports = class SmartThingsDeviceCooktop extends SmartThingsDevice {

  static CAPABILITIES = [
    // {
    //   homeyCapabilityId: 'samsung_cooktop_status_job',
    //   smartThingsComponentId: 'main',
    //   smartThingsCapabilityId: 'cooktopOperatingState',
    //   smartThingsAttributeId: 'cooktopJobState',
    //   async onReport({ value }) {
    //     if (value === 'finished') {
    //       this.homey.flow
    //         .getDeviceTriggerCard('samsung_cooktop_job_finished')
    //         .trigger(this)
    //         .catch(this.error);
    //     }

    //     return value;
    //   },
    // },
  ];

};
