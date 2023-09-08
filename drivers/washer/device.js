'use strict';

const SmartThingsDevice = require('../../lib/SmartThingsDevice');

module.exports = class SmartThingsDeviceWasher extends SmartThingsDevice {

  static CAPABILITIES = [
    {
      homeyCapabilityId: 'samsung_washer_progress_percentage',
      smartThingsComponentId: 'main',
      smartThingsCapabilityId: 'samsungce.washerOperatingState',
      smartThingsAttributeId: 'progress',
      async onReport({ value }) {
        return value;
      },
    },
    {
      homeyCapabilityId: 'samsung_washer_progress_remaining_time',
      smartThingsComponentId: 'main',
      smartThingsCapabilityId: 'samsungce.washerOperatingState',
      smartThingsAttributeId: 'remainingTimeStr',
      async onReport({ value }) {
        return value;
      },
    },
    {
      homeyCapabilityId: 'samsung_washer_current_job_state',
      smartThingsComponentId: 'main',
      smartThingsCapabilityId: 'samsungce.washerOperatingState',
      smartThingsAttributeId: 'washerJobState',
      async onReport({ value }) {
        if (value === 'finished') {
          this.homey.flow
            .getDeviceTriggerCard('samsung_washer_job_finished')
            .trigger(this)
            .catch(this.error);
        }

        return value;
      },
    },
  ];

  // onEvent(event) {
  //   super.onEvent(event);
  //   this.log('onEvent', JSON.stringify(event, false, 2));

  //   /*
  //   if (event.value && event.value.payload) {
  //     // Samsung AddWash Door Open
  //     if (event.value.payload['x.com.samsung.da.options']
  //       && event.value.payload['x.com.samsung.da.options'].includes('AddWashDoor_Open')) {
  //       Promise.resolve().then(async () => {
  //         if (!this.hasCapability('alarm_samsung_washer_addwash_door_open')) {
  //           await this.addCapability('alarm_samsung_washer_addwash_door_open');
  //         }

  //         await this.setCapabilityValue('alarm_samsung_washer_addwash_door_open', true);
  //       }).catch(this.error);
  //     }

  //     // Samsung AddWash Door Closed
  //     if (event.value.payload['x.com.samsung.da.options']
  //       && event.value.payload['x.com.samsung.da.options'].includes('AddWashDoor_Close')) {
  //       Promise.resolve().then(async () => {
  //         if (!this.hasCapability('alarm_samsung_washer_addwash_door_open')) {
  //           await this.addCapability('alarm_samsung_washer_addwash_door_open');
  //         }

  //         await this.setCapabilityValue('alarm_samsung_washer_addwash_door_open', false);
  //       }).catch(this.error);
  //     }

  //     // Cumulative Power Meter
  //     if (typeof event.value.payload['x.com.samsung.da.cumulativePower'] === 'string'
  //       && event.value.payload['x.com.samsung.da.cumulativeUnit'] === 'Wh') {
  //       Promise.resolve().then(async () => {
  //         if (!this.hasCapability('meter_power')) {
  //           await this.addCapability('meter_power');
  //         }

  //         const value = parseFloat(event.value.payload['x.com.samsung.da.cumulativePower'], 10) / 1000;
  //         await this.setCapabilityValue('meter_power', value);
  //       }).catch(this.error);
  //     }
  //   */
  // }

};
