'use strict';

const SmartThingsDriver = require('../../lib/SmartThingsDriver');

module.exports = class SmartThingsDriverDryer extends SmartThingsDriver { 
   
 async onOAuth2Init() {
    await super.onOAuth2Init();

    this.homey.flow.getActionCard('set_dryer_state')
      .registerRunListener(async ({ device, state }) => {
        const selectedState = state; // "run", "pause" or "stop"
        await device.executeCommand({
          component: 'main',
          capability: 'dryerOperatingState',
          command: 'setMachineState',
          args: [selectedState],
        });       
      });
  }
  onPairFilterDevice(device) {
    this.log('onPairFilterDevice', device.deviceTypeName);

    if (device.deviceTypeName === 'Samsung OCF Dryer') return true;
    return false;
  }

};
