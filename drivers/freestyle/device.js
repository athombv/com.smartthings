'use strict';

const SmartThingsDevice = require('../../lib/SmartThingsDevice');

module.exports = class SmartThingsDeviceTheFreestyle extends SmartThingsDevice {

  static CAPABILITIES = [
    {
      homeyCapabilityId: 'onoff',
      smartThingsComponentId: 'main',
      smartThingsCapabilityId: 'switch',
      smartThingsAttributeId: 'switch',
      async onSet({ value }) {
        await this.executeCommand({
          component: 'main',
          capability: 'switch',
          command: value
            ? 'on'
            : 'off',
        });
      },
      async onReport({ value }) {
        return value === 'on';
      },
    },
    {
      homeyCapabilityId: 'volume_up',
      smartThingsComponentId: 'main',
      smartThingsCapabilityId: 'audioVolume',
      async onSet() {
        await this.executeCommand({
          component: 'main',
          capability: 'audioVolume',
          command: 'volumeUp',
        });
      },
    },
    {
      homeyCapabilityId: 'volume_down',
      smartThingsComponentId: 'main',
      smartThingsCapabilityId: 'audioVolume',
      async onSet() {
        await this.executeCommand({
          component: 'main',
          capability: 'audioVolume',
          command: 'volumeDown',
        });
      },
    },
    {
      homeyCapabilityId: 'channel_up',
      smartThingsComponentId: 'main',
      smartThingsCapabilityId: 'tvChannel',
      async onSet() {
        await this.executeCommand({
          component: 'main',
          capability: 'tvChannel',
          command: 'channelUp',
        });
      },
    },
    {
      homeyCapabilityId: 'channel_down',
      smartThingsComponentId: 'main',
      smartThingsCapabilityId: 'tvChannel',
      async onSet() {
        await this.executeCommand({
          component: 'main',
          capability: 'tvChannel',
          command: 'channelDown',
        });
      },
    },
  ];

  async launchApp({ appId }) {
    await this.executeCommand({
      component: 'main',
      capability: 'custom.launchapp',
      command: 'launchApp',
      args: [appId],
    });
  }

};
