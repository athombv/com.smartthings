'use strict';

const SmartThingsDriver = require('../../lib/SmartThingsDriver');

module.exports = class SmartThingsDriverWasher extends SmartThingsDriver {

  onPairFilterDevice(device) {
    this.log('onPairFilterDevice', device.deviceTypeName);

    if (device.deviceTypeName === 'Samsung OCF Refrigerator') return true;
    return false;
  }

};
