'use strict';

const SmartThingsDriver = require('../../lib/SmartThingsDriver');

module.exports = class SmartThingsDriverRobotVacuum extends SmartThingsDriver {

  async onOAuth2Init() {
    await super.onOAuth2Init();
  }

  onPairFilterDevice(device) {
    this.log('onPairFilterDevice', device.deviceTypeName);

    if (device.deviceTypeName === 'Samsung OCF Robot Vacuum') return true;
    return false;
  }

};
