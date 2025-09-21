'use strict';

module.exports = {
  async getDryerState({ homey, query }) {

    const selectedDeviceId = query.deviceId;

    const driver = await homey.drivers.getDriver('dryer');
    const devices = driver.getDevices();

    console.log('Devices found:', devices.map(d => d.getName()));

    const selectedDevice = devices.find(device => device.getId() === selectedDeviceId);

    const name = await selectedDevice.getName();
    console.log(`Selected device: ${name}`);
    let state = await selectedDevice.getCapabilityValue('samsung_dryer_current_job_state');
    let progress = await selectedDevice.getCapabilityValue('samsung_dryer_progress_percentage');
    let remainingTime = await selectedDevice.getCapabilityValue('samsung_dryer_progress_remaining_time');

    if (state === 'none') state = 'off';
    if (state === 'off') remainingTime = '-';
    if (progress === 1) progress = 0;

    return {
      name,
      state,
      progress,
      remainingTime,
    };
  },
};
