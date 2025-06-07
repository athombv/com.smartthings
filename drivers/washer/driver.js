'use strict';

const SmartThingsDriver = require('../../lib/SmartThingsDriver');

module.exports = class SmartThingsDriverWasher extends SmartThingsDriver {

  async onOAuth2Init() {
    await super.onOAuth2Init();

    // Register condition card for checking if washer is running
    this.homey.flow
      .getConditionCard('samsung_washer_job_running')
      .registerRunListener(async ({ device }) => {
        // Get the current job state from the device
        const currentJobState = device.getCapabilityValue('samsung_washer_current_job_state');
        
        // Return true if washer is running (not in idle/finished/none state)
        const idleStates = ['finished', 'idle', 'none', null, undefined];
        return currentJobState && !idleStates.includes(currentJobState);
      });
  }

  onPairFilterDevice(device) {
    this.log('onPairFilterDevice', device.deviceTypeName);

    if (device.deviceTypeName === 'Samsung OCF Washer') return true;
    return false;
  }

};
