'use strict';

module.exports = {
  async getWasherState({ homey, query }) {

    const selectedDeviceId = query.deviceId;

    const driver = await homey.drivers.getDriver('washer');
    const devices = driver.getDevices();

    const selectedDevice = devices.find(device => device.getId() === selectedDeviceId);

    const name = await selectedDevice.getName();
    let state = await selectedDevice.getCapabilityValue('samsung_washer_current_job_state');
    let progress = await selectedDevice.getCapabilityValue('samsung_washer_progress_percentage');
    let remainingTime = await selectedDevice.getCapabilityValue('samsung_washer_progress_remaining_time');

    if (state == 'none') state = 'off';
    if (state == 'off') remainingTime = '-';
    if (progress == 1) progress = 0;

    return {
      name,
      state,
      progress,
      remainingTime,
    };
  },
};
