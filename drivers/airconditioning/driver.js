'use strict';

const SmartThingsDriver = require('../../lib/SmartThingsDriver');

module.exports = class SmartThingsDriverAirconditioning extends SmartThingsDriver {

  async onOAuth2Init() {
    await super.onOAuth2Init();

    this.homey.flow
      .getActionCard('set_mode')
      .registerRunListener(async ({ device, mode }) => {
        await device.executeCommand({
          component: 'main',
          capability: 'airConditionerMode',
          command: 'setAirConditionerMode',
          args: [mode],
        });
      });

    this.homey.flow
      .getActionCard('set_fan_mode')
      .registerRunListener(async ({ device, mode }) => {
        await device.executeCommand({
          component: 'main',
          capability: 'airConditionerFanMode',
          command: 'setFanMode',
          args: [mode],
        });
      });

    this.homey.flow
      .getActionCard('set_fan_oscillation_mode')
      .registerRunListener(async ({ device, mode }) => {
        await device.executeCommand({
          component: 'main',
          capability: 'fanOscillationMode',
          command: 'setFanOscillationMode',
          args: [mode],
        });
      });
  }

  onPairFilterDevice(device) {
    this.log('onPairFilterDevice', device.deviceTypeName);

    if (device.deviceTypeName === 'Samsung OCF Air Conditioner') return true;
    return false;
  }

};
