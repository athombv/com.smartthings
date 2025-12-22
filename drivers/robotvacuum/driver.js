'use strict';

const SmartThingsDriver = require('../../lib/SmartThingsDriver');

module.exports = class SmartThingsDriverRobotVacuum extends SmartThingsDriver {

  async onOAuth2Init() {
    await super.onOAuth2Init();

    this.homey.flow
      .getActionCard('samsung_robotvacuum_start')
      .registerRunListener(async ({ device }) => {
        await device.executeCommand({
          component: 'main',
          capability: 'samsungce.robotCleanerOperatingState',
          command: 'start',
        });
      });

    this.homey.flow
      .getActionCard('samsung_robotvacuum_pause')
      .registerRunListener(async ({ device }) => {
        await device.executeCommand({
          component: 'main',
          capability: 'samsungce.robotCleanerOperatingState',
          command: 'pause',
        });
      });

    this.homey.flow
      .getActionCard('samsung_robotvacuum_resume')
      .registerRunListener(async ({ device }) => {
        await device.executeCommand({
          component: 'main',
          capability: 'samsungce.robotCleanerOperatingState',
          command: 'resume',
        });
      });

    this.homey.flow
      .getActionCard('samsung_robotvacuum_return_to_home')
      .registerRunListener(async ({ device }) => {
        await device.executeCommand({
          component: 'main',
          capability: 'samsungce.robotCleanerOperatingState',
          command: 'returnToHome',
        });
      });
  }

  onPairFilterDevice(device) {
    this.log('onPairFilterDevice', device.deviceTypeName);

    if (device.deviceTypeName === 'Samsung OCF Robot Vacuum') return true;
    return false;
  }

};
