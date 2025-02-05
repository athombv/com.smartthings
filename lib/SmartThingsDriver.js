'use strict';

const {
  OAuth2Driver,
  OAuth2Util,
  fetch,
} = require('homey-oauth2app');

module.exports = class SmartThingsDriver extends OAuth2Driver {

  onPair(session) {
    const OAuth2ConfigId = this.getOAuth2ConfigId();
    let OAuth2SessionId = OAuth2Util.getRandomId();

    let client;
    let clientId;
    let clientSecret;

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

    session.setHandler('hasClient', async () => {
      return !!client;
    });

    session.setHandler('validateKey', async apikey => {
      this.log(`Creating API Client with API Key ${apikey}...`);

      // Create an OAuth2 Client on behalf of the user's API key
      const res = await fetch('https://api.smartthings.com/v1/apps', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apikey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          appName: `homey-${OAuth2SessionId}-${Date.now()}`,
          displayName: 'Homey',
          description: 'A Better Smart Home',
          appType: 'API_ONLY',
          classifications: ['DEVICE'],
          oauth: {
            clientName: 'Homey',
            scope: [
              'r:devices:*',
              'x:devices:*',
            ],
            redirectUris: ['https://callback.athom.com/oauth2/callback'],
          },
        }),
      });

      if (!res.ok) {
        throw new Error(res.statusText);
      }

      const resJson = await res.json();
      clientId = resJson.oauthClientId;
      clientSecret = resJson.oauthClientSecret;
      this.log(resJson);

      client = this.homey.app.createOAuth2Client({
        sessionId: OAuth2SessionId,
        configId: OAuth2ConfigId,
      });

      client._clientId = clientId;
      client._clientSecret = clientSecret;

      return true;
    });

    session.setHandler('showView', async viewId => {
      if (viewId === 'login_oauth2') {
        try {
          const oAuth2AuthorizationUrl = client.getAuthorizationUrl();
          const oAuth2Callback = await this.homey.cloud.createOAuth2Callback(oAuth2AuthorizationUrl);
          oAuth2Callback
            .on('url', url => {
              session.emit('url', url).catch(this.error);
            })
            .on('code', code => {
              client.getTokenByCode({ code })
                .then(async () => {
                  const token = client.getToken();
                  console.log('token 1', token);

                  // Save Client ID & Secret in the Token
                  token.client_id = client._clientId;
                  token.client_secret = client._clientSecret;

                  console.log('token 2', token);

                  session.emit('authorized').catch(this.error);
                })
                .catch(err => {
                  console.error('err', err);
                  session.emit('error', err.message || err.toString()).catch(this.error);
                });
            });
        } catch (err) {
          session.emit('error', err.message || err.toString()).catch(this.error);
        }
      }
    });

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
