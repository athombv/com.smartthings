'use strict';

const SmartThingsDriver = require('../../lib/SmartThingsDriver');

module.exports = class SmartThingsDriverAC extends SmartThingsDriver {

  async onOAuth2Init() {
    await super.onOAuth2Init();

    this.homey.flow
      .getActionCard('set_air_conditioning_mode')
      .registerRunListener(async ({ device, airConditioningMode }) => {
        return device.executeCommand({
          capability: 'airConditionerMode',
          command: 'setAirConditionerMode',
          args: [airConditioningMode],
        });
      });

    this.homey.flow
      .getActionCard('set_air_conditioning_fan_mode')
      .registerRunListener(async ({ device, airConditioningFanMode }) => {
        return device.executeCommand({
          capability: 'airConditionerFanMode',
          command: 'setFanMode',
          args: [airConditioningFanMode],
        });
      });

    this.homey.flow
      .getActionCard('set_air_conditioning_fan_oscillation_mode')
      .registerRunListener(async ({ device, airConditioningFanOscillationMode }) => {
        return device.executeCommand({
          capability: 'fanOscillationMode',
          command: 'setFanOscillationMode',
          args: [airConditioningFanOscillationMode],
        });
      });
  }

  onPairFilterDevice(device) {
    this.log('onPairFilterDevice', device.deviceTypeName);

    return device.deviceTypeName === 'Samsung OCF TV'; //@TODO: AC NAME?
  }

};
