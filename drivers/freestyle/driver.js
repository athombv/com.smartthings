'use strict';

const SmartThingsDriver = require('../../lib/SmartThingsDriver');

module.exports = class SmartThingsDriverTheFreestyle extends SmartThingsDriver {

  async onOAuth2Init() {
    await super.onOAuth2Init();

    this.homey.flow
      .getActionCard('samsung_freestyle_set_volume')
      .registerRunListener(async ({ device, volume }) => {
        return device.executeCommand({
          capability: 'audioVolume',
          command: 'setVolume',
          args: [Math.round(volume * 100)],
        });
      });

    this.homey.flow
      .getActionCard('samsung_freestyle_set_volume_mute')
      .registerRunListener(async ({ device }) => {
        return device.executeCommand({
          component: 'main',
          capability: 'audioMute',
          command: 'mute',
        });
      });

    this.homey.flow
      .getActionCard('samsung_freestyle_set_volume_unmute')
      .registerRunListener(async ({ device }) => {
        return device.executeCommand({
          component: 'main',
          capability: 'audioMute',
          command: 'unmute',
        });
      });

    this.homey.flow
      .getActionCard('samsung_freestyle_launch_app')
      .registerRunListener(async ({ device, app }) => {
        return device.launchApp({
          appId: app.id,
        });
      })
      .getArgument('app')
      .registerAutocompleteListener(async (query, args) => {
        // TODO: We should get this list dynamically somehow.
        const result = [
          {
            id: '111299001912',
            title: 'YouTube',
          },
          {
            id: '3201907018807',
            title: 'Netflix',
          },
          {
            id: '3201910019365',
            title: 'Prime Video',
          },
          {
            id: '3201807016597',
            title: 'Apple TV',
          },
        ]
          .filter(app => app.title.toLowerCase().includes(query.toLowerCase()))
          .map(app => ({
            id: app.id,
            title: app.title,
          }));

        // Check if query is an app id
        if (/^\d+(\.\d+)?$/.test(query) && !result.find(app => app.id === query)) {
          result.unshift({
            id: query,
            title: `App ID: ${query}`,
          });
        }

        return result;
      });
  }

  onPairFilterDevice(device) {
    this.log('onPairFilterDevice', device.deviceTypeName);

    if (device.deviceTypeName === 'x.com.st.d.projector') return true;
    return false;
  }

};
