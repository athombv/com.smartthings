'use strict';

const SmartThingsDriver = require('../../lib/SmartThingsDriver');

module.exports = class SmartThingsDriverWasher extends SmartThingsDriver {

  onPairFilterDevice(device) {
    if (device.deviceTypeName === 'Samsung OCF Washer') return true;
    return false;
  }

};
