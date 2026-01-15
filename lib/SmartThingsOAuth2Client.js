'use strict';

const Homey = require('homey');
const {
  OAuth2Client,
  OAuth2Error,
  fetch,
} = require('homey-oauth2app');

const SmartThingsOAuth2Token = require('./SmartThingsOAuth2Token');

module.exports = class SmartThingsOAuth2Client extends OAuth2Client {

  static CLIENT_ID = 'not_used';
  static CLIENT_SECRET = 'not_used';
  static API_URL = 'https://api.smartthings.com';
  static TOKEN_URL = 'https://auth-global.api.smartthings.com/oauth/token';
  static TOKEN = SmartThingsOAuth2Token;
  static AUTHORIZATION_URL = 'https://api.smartthings.com/oauth/authorize';
  static SCOPES = ['r:devices:*', 'x:devices:*'];

  __clientId = null;
  get _clientId() {
    return this.__clientId ?? this._token?.client_id ?? null;
  }

  set _clientId(value) {
    this.__clientId = value;
  }

  __clientSecret = null;
  get _clientSecret() {
    return this.__clientSecret ?? this._token?.client_secret ?? null;
  }

  set _clientSecret(value) {
    this.__clientSecret = value;
  }

  _registeredDevices = new Map();
  _webhooks = {
    // [installedAppId]: Promise
  };

  async onShouldRefreshToken(...props) {
    if (this.token?.refresh_token === null) return false; // Never refresh static api keys
    return super.onShouldRefreshToken(...props);
  }

  async onRefreshToken() {
    try {
      const token = this.getToken();
      if (!token) {
        throw new OAuth2Error('Missing Token');
      }

      this.debug('Refreshing token...');

      if (!token.isRefreshable()) {
        throw new OAuth2Error('Token cannot be refreshed');
      }

      const body = new URLSearchParams();
      body.append('grant_type', 'refresh_token');
      body.append('client_id', this._clientId);
      body.append('client_secret', this._clientSecret);
      body.append('refresh_token', token.refresh_token);

      const response = await fetch(this._tokenUrl, {
        headers: {
          Authorization: `Basic ${Buffer.from(`${this._clientId}:${this._clientSecret}`).toString('base64')}`,
        },
        body,
        method: 'POST',
      });
      if (!response.ok) {
        return this.onHandleRefreshTokenError({ response });
      }

      this._token = await this.onHandleRefreshTokenResponse({ response });

      this.debug('Refreshed token!', this._token);
      this.save();

      return this.getToken();
    } catch (err) {
      if (err.message === 'Token cannot be refreshed') {
        throw new Error('The API Key that was previously used, has been disabled by Samsung SmartThings. To fix this, please repair your device.');
      }

      throw err;
    }
  }

  async onGetTokenByCode({ code }) {
    const body = new URLSearchParams();
    body.append('grant_type', 'authorization_code');
    body.append('code', code);
    body.append('redirect_uri', this._redirectUrl);

    const response = await fetch(this._tokenUrl, {
      headers: {
        Authorization: `Basic ${Buffer.from(`${this._clientId}:${this._clientSecret}`).toString('base64')}`,
      },
      body,
      method: 'POST',
    });
    if (!response.ok) {
      return this.onHandleGetTokenByCodeError({ response });
    }

    this._token = await this.onHandleGetTokenByCodeResponse({ response });
    return this.getToken();
  }

  async onHandleNotOK({
    body,
    ...props
  }) {
    if (body
      && body.error
      && Array.isArray(body.error.details)
      && body.error.details.length
      && body.error.details[0]
      && body.error.details[0].message) {
      throw new OAuth2Error(body.error.details[0].message);
    }

    return super.onHandleNotOK({
      body,
      ...props,
    });
  }

  async getApps() {
    return this.get({
      path: '/v1/apps',
    });
  }

  async getDevices() {
    return this.get({
      path: '/devices',
    }).then(({ items }) => items);
  }

  async getDevice({ deviceId }) {
    return this.get({
      path: `/devices/${deviceId}`,
    });
  }

  async getDeviceStatus({ deviceId }) {
    return this.get({
      path: `/devices/${deviceId}/status`,
    });
  }

  async executeDeviceCommand({
    deviceId,
    component = 'main',
    capability,
    command,
    args = [],
  }) {
    return this.post({
      path: `/devices/${deviceId}/commands`,
      json: [{
        command,
        capability,
        component,
        arguments: args,
      }],
    });
  }

  async createSubscription({
    deviceId,
    installedAppId,
  } = {}) {
    await this.post({
      path: `/v1/installedapps/${installedAppId}/subscriptions`,
      json: {
        sourceType: 'DEVICE',
        device: {
          deviceId,
        },
      },
    }).catch(err => {
      if (err.status === 409) return; // Subscription already exists
      throw err;
    });
  }

  async registerDevice({
    deviceId,
    onEvent = () => { },
  }) {
    const token = await this.getToken();
    if (!token.installed_app_id) {
      throw new Error('Please repair this device to get realtime updates.');
    }

    await this.createSubscription({
      deviceId,
      installedAppId: token.installed_app_id,
    });

    if (!this._webhooks[token.installed_app_id]) {
      this._webhooks[token.installed_app_id] = Promise.resolve().then(async () => {
        const webhook = await this.homey.cloud.createWebhook(Homey.env.WEBHOOK_ID, Homey.env.WEBHOOK_SECRET, {
          $keys: [token.installed_app_id],
        });
        webhook.on('message', ({ body }) => {
          switch (body?.messageType) {
            case 'EVENT': {
              for (const event of body?.eventData?.events) {
                switch (event.eventType) {
                  case 'DEVICE_EVENT': {
                    const { deviceId } = event.deviceEvent;
                    if (!deviceId) break;

                    const registeredDevice = this._registeredDevices.get(deviceId);
                    if (registeredDevice) {
                      Promise.resolve().then(async () => {
                        await registeredDevice.onEvent(event.deviceEvent);
                      }).catch(err => this.error(`Error Calling onEvent for Device ${event.deviceId}: ${err.message}`));
                    }
                    break;
                  }
                  default: {
                    break;
                  }
                }
              }
              break;
            }
            default: {
              break;
            }
          }
        });

        return webhook;
      });
      this._webhooks[token.installed_app_id]
        .then(() => this.log('Webhook Registered'))
        .catch(err => {
          this.error(`Error Registering Webhook: ${err.message}`);
          delete this.webhook;
        });
    }

    await this._webhooks[token.installed_app_id];

    this._registeredDevices.set(deviceId, { onEvent });
  }

  async unregisterDevice({ deviceId }) {
    this._registeredDevices.delete(deviceId);
  }

};
