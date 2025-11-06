'use strict';

const SmartThingsDriver = require('../../lib/SmartThingsDriver');

module.exports = class SmartThingsDriverDishwasher extends SmartThingsDriver {

  async onOAuth2Init() {
    await super.onOAuth2Init();

    this.homey.flow
      .getDeviceTriggerCard('samsung_dishwasher_washing_course_changed')
      .registerRunListener(async (args, state) => {
        return args.value === state.value;
      });

    this.homey.flow
      .getDeviceTriggerCard('samsung_dishwasher_current_job_state_changed')
      .registerRunListener(async (args, state) => {
        return args.value === state.value;
      });

    this.homey.flow
      .getActionCard('samsung_dishwasher_set_delay_start_time')
      .registerRunListener(async ({ device, time }) => {
        await device.executeCommand({
          component: 'main',
          capability: 'custom.dishwasherDelayStartTime',
          command: 'setDishwasherDelayStartTime',
          args: [`${time}:00`],
        });
      });

    this.homey.flow
      .getActionCard('samsung_dishwasher_pause')
      .registerRunListener(async ({ device }) => {
        await device.executeCommand({
          component: 'main',
          capability: 'samsungce.dishwasherOperation',
          command: 'pause',
        });
      });

    this.homey.flow
      .getActionCard('samsung_dishwasher_resume')
      .registerRunListener(async ({ device }) => {
        await device.executeCommand({
          component: 'main',
          capability: 'samsungce.dishwasherOperation',
          command: 'resume',
        });
      });

    this.homey.flow
      .getActionCard('samsung_dishwasher_cancel_cycle')
      .registerRunListener(async ({ device }) => {
        await device.executeCommand({
          component: 'main',
          capability: 'samsungce.dishwasherOperation',
          command: 'cancel',
          args: [true],
        });
      });
  }

  onPairFilterDevice(device) {
    this.log('onPairFilterDevice', device.deviceTypeName);

    if (device.deviceTypeName === 'Samsung OCF Dishwasher') return true;
    return false;
  }

};
