'use strict';

const SmartThingsDriver = require('../../lib/SmartThingsDriver');

module.exports = class SmartThingsDriverWasher extends SmartThingsDriver {

  onPairFilterDevice(device) {
    if (device.deviceTypeName === 'Samsung OCF Refrigerator') return true;
    return false;
  }

};
