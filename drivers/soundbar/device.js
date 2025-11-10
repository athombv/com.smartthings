'use strict';

const SmartThingsDevice = require('../../lib/SmartThingsDevice');

module.exports = class SmartThingsDeviceSoundbar extends SmartThingsDevice {

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
      homeyCapabilityId: 'volume_set',
      smartThingsComponentId: 'main',
      smartThingsCapabilityId: 'audioVolume',
      smartThingsAttributeId: 'volume',
      async onReport({ value }) {
        return value / 100;
      },
      async onSet({ value }) {
        await this.executeCommand({
          component: 'main',
          capability: 'audioVolume',
          command: 'setVolume',
          args: [Math.round(value * 100)],
        });
      },
    },
  ];

};
