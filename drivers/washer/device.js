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
        const homeyCapabilityId = 'samsung_washer_current_job_state';

        const flowArray = [
          {
            value: 'finished',
            flow: 'samsung_washer_job_finished',
          },
          {
            value: 'wash',
            flow: 'samsung_washer_job_started',
          },
          {
            value: 'weightSensing',
            flow: 'samsung_washer_job_weight_sensing',
          },
          {
            value: 'preWash',
            flow: 'samsung_washer_job_pre_wash',
          },
          {
            value: 'rinse',
            flow: 'samsung_washer_job_rinse',
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
