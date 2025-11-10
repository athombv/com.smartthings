'use strict';

const SmartThingsDriver = require('../../lib/SmartThingsDriver');

module.exports = class SmartThingsDriverMicrowave extends SmartThingsDriver {

  async onOAuth2Init() {
    await super.onOAuth2Init();
  }

  onPairFilterDevice(device) {
    this.log('onPairFilterDevice', device.deviceTypeName);

    if (device.deviceTypeName === 'oic.d.microwave') return true;
    return false;
  }

};
