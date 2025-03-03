'use strict';

const EventSource = require('eventsource');
const {
  OAuth2Client,
  OAuth2Error,
  fetch,
} = require('homey-oauth2app');

const SmartThingsOAuth2Token = require('./SmartThingsOAuth2Token');

// const EVENT_SOURCE_READY_STATE_CONNECTING = 0;
// const EVENT_SOURCE_READY_STATE_OPEN = 1;
const EVENT_SOURCE_READY_STATE_CLOSED = 2;

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

  eventSource = null;
  eventSourceDevices = {};
  eventSourceSubscriptionId = null;

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
    name = 'homey',
    version = 1,
  } = {}) {
    return this.post({
      path: '/subscriptions',
      json: {
        name,
        version,
        subscriptionFilters: [
          {
            type: 'LOCATIONIDS',
            value: [
              'ALL',
            ],
          },
        ],
      },
    });
  }

  async deleteSubscription({ subscriptionId }) {
    return this.delete({
      path: `/subscription/${subscriptionId}`,
    });
  }

  async registerDevice({
    deviceId,
    onEvent = () => { },
  }) {
    this.eventSourceDevices[deviceId] = onEvent;
    this.log(`Registered ${deviceId}`);

    // Start Watchdog
    if (!this.eventSourceWatchdog) {
      this.eventSourceWatchdog = this.homey.setInterval(() => {
        if (this.__eventSource && this.__eventSource.readyState === EVENT_SOURCE_READY_STATE_CLOSED) {
          this.connect().catch(err => {
            this.error('EventSourceWatchdog Reconnect Error:', err);
          });
        }
      }, 5000);
    }

    return this.connect();
  }

  async unregisterDevice({
    deviceId,
  }) {
    delete this.eventSourceDevices[deviceId];
    this.log(`Unregistered ${deviceId}`);

    // Stop Watchdog
    if (this.eventSourceWatchdog) {
      this.homey.clearInterval(this.eventSourceWatchdog);
    }

    // If this was the last registered Device, disconnect EventSource.
    if (Object.keys(this.eventSourceDevices).length === 0) {
      // Close EventSource
      if (this.__eventSource) {
        this.__eventSource.close();
        this.__eventSource.removeAllListeners();
        delete this.__eventSource;
      }

      if (this.eventSource) {
        delete this.eventSource;
      }

      // Unregister subscription
      if (this.__eventSourceSubscriptionId) {
        this.deleteSubscription({
          subscriptionId: this.__eventSourceSubscriptionId,
        }).catch(err => this.error(`Error Deleting Subscription: ${err.message}`));

        delete this.__eventSourceSubscriptionId;
      }
    }
  }

  async connect() {
    if (!this.eventSource) {
      this.eventSource = Promise.resolve().then(async () => {
        const {
          subscriptionId,
          registrationUrl,
        } = await this.createSubscription();
        this.log('Created Subscription');

        // Get the Token
        const token = await this.getToken();

        // Clear previous instance
        if (this.__eventSource) {
          this.__eventSource.close();
          this.__eventSource.removeAllListeners();
        }

        // Create an EventSource connection
        this.__eventSourceSubscriptionId = subscriptionId;
        this.__eventSource = new EventSource(registrationUrl, {
          headers: {
            Authorization: `Bearer ${token.access_token}`,
          },
        });

        // Wait until connection is open
        await new Promise((resolve, reject) => {
          this.__eventSource.on('error', err => {
            delete this.eventSource;

            this.error('EventSource Error:', err);
            reject(err);
          });
          this.__eventSource.on('CONTROL_EVENT', event => {
            if (event.data === 'welcome') resolve();
          });
        });

        this.log(`Connected to ${registrationUrl}`);

        this.__eventSource.on('DEVICE_EVENT', ({ data }) => {
          try {
            data = JSON.parse(data);
            const { deviceEvent } = data;
            if (deviceEvent) {
              const { deviceId } = deviceEvent;
              if (typeof this.eventSourceDevices[deviceId] === 'function') {
                Promise.resolve().then(async () => {
                  await this.eventSourceDevices[deviceId](deviceEvent);
                }).catch(this.error);
              }
            }
          } catch (err) {
            this.error('Error parsing EventSource data:', err);
          }
        });

        return this.__eventSource;
      });
    }

    return this.eventSource;
  }

};
