'use strict';

const {
  OAuth2Driver,
  OAuth2Util,
} = require('homey-oauth2app');
const SmartThingsOAuth2Token = require('./SmartThingsOAuth2Token');

module.exports = class SmartThingsDriver extends OAuth2Driver {

  onRepair(session, device) {
    session.setHandler('validateKey', async apikey => {
      this.log(`Validating API Key ${apikey}...`);
      const token = new SmartThingsOAuth2Token({
        access_token: apikey,
      });

      device.oAuth2Client.setToken({ token });

      // Test API Key
      try {
        await device.oAuth2Client.getDevices();
        this.log('Valid API Key');

        await device.oAuth2Client.save();

        console.log('_refreshingToken', device.oAuth2Client._refreshingToken);

        await device.onOAuth2Uninit().catch(err => {
          this.error(`Error Uninitializing OAuth2: ${err.message}`);
        });
        await device.onOAuth2Init().catch(err => {
          this.error(`Error Initializing OAuth2: ${err.message}`);
        });
        return true;
      } catch (err) {
        this.error(err);
        return false;
      }
    });
  }

  onPair(session) {
    const OAuth2ConfigId = this.getOAuth2ConfigId();
    let OAuth2SessionId = OAuth2Util.getRandomId();

    let client;

    const savedSessions = this.homey.app.getSavedOAuth2Sessions();
    if (Object.keys(savedSessions).length) {
      OAuth2SessionId = Object.keys(savedSessions)[0];
      try {
        client = this.homey.app.getOAuth2Client({
          configId: OAuth2ConfigId,
          sessionId: OAuth2SessionId,
        });
      } catch (err) {
        this.error(err);
      }
    }

    session.setHandler('list_devices', async () => {
      const devices = await this.onPairListDevices({
        oAuth2Client: client,
      });

      return devices.map(device => {
        return {
          ...device,
          store: {
            ...device.store,
            OAuth2SessionId,
            OAuth2ConfigId,
          },
        };
      });
    });

    session.setHandler('hasClient', async () => {
      return !!client;
    });

    session.setHandler('validateKey', async apikey => {
      this.log(`Validating API Key ${apikey}...`);
      const token = new SmartThingsOAuth2Token({
        access_token: apikey,
      });

      if (!client) {
        client = this.homey.app.createOAuth2Client({
          sessionId: OAuth2SessionId,
          configId: OAuth2ConfigId,
        });

        client.setTitle({
          title: 'API Key',
        });
      }

      client.setToken({ token });

      // Test API Key
      try {
        await client.getDevices();
        return true;
      } catch (err) {
        this.error(err);
        return false;
      }
    });

    session.setHandler('add_device', async () => {
      this.log('At least one device has been added, saving the client...');
      client.save();
    });
  }

  async onPairListDevices({ oAuth2Client }) {
    const devices = await oAuth2Client.getDevices();
    return devices
      .filter(device => this.onPairFilterDevice(device))
      .map(device => this.onPairListDevice(device));
  }

  onPairFilterDevice(device) {
    // Use e.g. `device.deviceTypeName`
    return false;
  }

  onPairListDevice(device) {
    return {
      name: device.label || device.name,
      data: {
        deviceId: device.deviceId,
        locationId: device.locationId,
      },
    };
  }

};
