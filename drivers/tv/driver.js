'use strict';

const SmartThingsDriver = require('../../lib/SmartThingsDriver');

module.exports = class SmartThingsDriverTV extends SmartThingsDriver {

  async onOAuth2Init() {
    await super.onOAuth2Init();

    this.homey.flow
      .getActionCard('set_volume')
      .registerRunListener(async ({ device, volume }) => {
        return device.executeCommand({
          capability: 'audioVolume',
          command: 'setVolume',
          args: [Math.round(volume * 100)],
        });
      });

    this.homey.flow
      .getActionCard('set_volume_mute')
      .registerRunListener(async ({ device }) => {
        return device.executeCommand({
          component: 'main',
          capability: 'audioVolume',
          command: 'mute',
        });
      });

    this.homey.flow
      .getActionCard('set_volume_unmute')
      .registerRunListener(async ({ device }) => {
        return device.executeCommand({
          component: 'main',
          capability: 'audioVolume',
          command: 'unmute',
        });
      });

    // We haven't found a TV that supports the `samsungTV` capability yet.
    // this.homey.flow
    //   .getActionCard('show_message')
    //   .registerRunListener(async ({ device, message }) => {
    //     return device.onFlowActionShowMessage({ message });
    //   });
    //
    // driver.flow.compose.json:
    // {
    //   "id": "show_message",
    //   "title": {
    //     "en": "Show a message"
    //   },
    //   "titleFormatted": {
    //     "en": "Show message [[message]] on TV"
    //   },
    //   "args": [
    //     {
    //       "name": "message",
    //       "type": "text",
    //       "title": {
    //         "en": "Message"
    //       },
    //       "placeholder": {
    //         "en": "Hello from Homey!"
    //       }
    //     }
    //   ]
    // },
  }

  onPairFilterDevice(device) {
    this.log('onPairFilterDevice', device.deviceTypeName);

    if (device.deviceTypeName === 'Samsung OCF TV') return true;
    return false;
  }

};
