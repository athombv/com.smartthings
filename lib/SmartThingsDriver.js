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

    let appId;
    let appName;

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

      appName = `homey-${OAuth2SessionId}-${Date.now()}`;

      // Create an OAuth2 Client on behalf of the user's API key
      const res = await fetch('https://api.smartthings.com/v1/apps', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apikey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          appName,
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
          apiOnly: {
            targetUrl: 'https://gerlu4dzhba4xrnasvt2oi3mmu0uzhij.lambda-url.eu-west-1.on.aws',
          },
        }),
      });

      if (!res.ok) {
        throw new Error(res.statusText);
      }

      const resJson = await res.json();
      appId = resJson.app?.appId;
      clientId = resJson.oauthClientId;
      clientSecret = resJson.oauthClientSecret;

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

                  // Save Client ID & Secret in the Token
                  token.app_id = appId;
                  token.app_name = appName;
                  token.client_id = client._clientId;
                  token.client_secret = client._clientSecret;

                  session.emit('authorized').catch(this.error);
                })
                .catch(err => {
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

  onRepair(session, device) {
    const { OAuth2SessionId } = device.getStore();
    const { oAuth2Client: client } = device;
    const token = client.getToken();

    let appId;
    let appName;

    let clientId = token.client_id ?? null;
    let clientSecret = token.client_secret ?? null;

    session.setHandler('validateKey', async apikey => {
      this.log(`Creating API Client with API Key ${apikey}...`);

      appName = `homey-${OAuth2SessionId}-${Date.now()}`;

      // Create an OAuth2 Client on behalf of the user's API key
      const res = await fetch('https://api.smartthings.com/v1/apps', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apikey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          appName,
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
          apiOnly: {
            targetUrl: 'https://gerlu4dzhba4xrnasvt2oi3mmu0uzhij.lambda-url.eu-west-1.on.aws',
          },
        }),
      });

      if (!res.ok) {
        throw new Error(res.statusText);
      }

      const resJson = await res.json();
      clientId = resJson.oauthClientId;
      clientSecret = resJson.oauthClientSecret;

      client._clientId = clientId;
      client._clientSecret = clientSecret;

      return true;
    });

    session.setHandler('showView', async viewId => {
      // Commented, because we always want to create a new OAuth2 Client on repair
      // if (viewId === 'apikey') {
      //   if (token.client_id && token.client_secret && token.installed_app_id) {
      //     session.showView('login_oauth2').catch(this.error);
      //     return;
      //   }
      // }

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

                  // Save Client ID & Secret in the Token
                  token.app_id = appId;
                  token.app_name = appName;
                  token.client_id = client._clientId;
                  token.client_secret = client._clientSecret;

                  // Save the OAuth2Client
                  client.save();

                  // Re-init all devices
                  const drivers = this.homey.drivers.getDrivers();
                  await Promise.all(Object.values(drivers).map(async driver => {
                    const devices = driver.getDevices();
                    await Promise.all(Object.values(devices).map(async device => {
                      const deviceId = device.getAppId();
                      try {
                        await device.onOAuth2Uninit();
                        await device.onOAuth2Init();
                        this.log(`Re-initialized device ${deviceId}`);
                      } catch (err) {
                        this.error(`Error re-initializing device ${deviceId}: ${err.message}`);
                      }
                    }));
                  }));

                  session.emit('authorized').catch(this.error);
                })
                .catch(err => {
                  session.emit('error', err.message || err.toString()).catch(this.error);
                });
            });
        } catch (err) {
          session.emit('error', err.message || err.toString()).catch(this.error);
        }
      }
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
