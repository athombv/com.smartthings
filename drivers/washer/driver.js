'use strict';

const SmartThingsDriver = require('../../lib/SmartThingsDriver');

module.exports = class SmartThingsDriverWasher extends SmartThingsDriver {

  async onOAuth2Init() {
    await super.onOAuth2Init();

    this.homey.flow.getActionCard('set_washer_state')
      .registerRunListener(async ({ device, state }) => {
        await device.executeCommand({
          component: 'main',
          capability: 'washerOperatingState',
          command: 'setMachineState',
          args: [state],
        });
      });

    this.homey.flow.getActionCard('set_washer_cycle')
      .registerRunListener(async ({ device, cycle }) => {
        await device.executeCommand({
          component: 'main',
          capability: 'samsungce.washerCycle',
          command: 'setWasherCycle',
          args: [cycle],
        });
      });

    this.homey.flow.getConditionCard('samsung_washer_remote_control_is_enabled')
      .registerRunListener(async ({ device }) => {
        return device.getCapabilityValue('samsung_washer_remote_control_enabled') === true;
      });
  }

  onPairFilterDevice(device) {
    this.log('onPairFilterDevice', device.deviceTypeName);
    if (device.deviceTypeName === 'Samsung OCF Washer') return true;
    return false;
  }

};
