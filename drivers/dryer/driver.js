'use strict';

const SmartThingsDriver = require('../../lib/SmartThingsDriver');

module.exports = class SmartThingsDriverDryer extends SmartThingsDriver {

  async onOAuth2Init() {
    await super.onOAuth2Init();

    this.homey.flow.getActionCard('set_dryer_state')
      .registerRunListener(async ({ device, state }) => {
        await device.executeCommand({
          component: 'main',
          capability: 'dryerOperatingState',
          command: 'setMachineState',
          args: [state],
        });
      });

    this.homey.flow.getActionCard('set_dryer_cycle')
      .registerRunListener(async ({ device, cycle }) => {
        await device.executeCommand({
          component: 'main',
          capability: 'samsungce.dryerCycle',
          command: 'setDryerCycle',
          args: [cycle],
        });
      });

    this.homey.flow.getConditionCard('samsung_dryer_remote_control_is_enabled')
      .registerRunListener(async ({ device }) => {
        return device.getCapabilityValue('samsung_dryer_remote_control_enabled') === true;
      });
  }

  onPairFilterDevice(device) {
    this.log('onPairFilterDevice', device.deviceTypeName);
    if (device.deviceTypeName === 'Samsung OCF Dryer') return true;
    return false;
  }

};
