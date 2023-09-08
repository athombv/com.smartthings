'use strict';

const EventSource = require('eventsource');
const { OAuth2Client, OAuth2Error } = require('homey-oauth2app');
const SmartThingsOAuth2Token = require('./SmartThingsOAuth2Token');

// const EVENT_SOURCE_READY_STATE_CONNECTING = 0;
// const EVENT_SOURCE_READY_STATE_OPEN = 1;
const EVENT_SOURCE_READY_STATE_CLOSED = 2;

module.exports = class SmartThingsOAuth2Client extends OAuth2Client {

  static CLIENT_ID = 'not_used';
  static CLIENT_SECRET = 'not_used';
  static API_URL = 'https://api.smartthings.com';
  static TOKEN = SmartThingsOAuth2Token;
  static TOKEN_URL = 'https://api.smartthings.com/oauth/token';
  static AUTHORIZATION_URL = 'https://api.smartthings.com/oauth/authorize';
  static CLIENT
  static SCOPES = ['r:devices:*', 'x:devices:*'];

  eventSource = null;
  eventSourceDevices = {};
  eventSourceSubscriptionId = null;

  async onShouldRefreshToken() {
    return false;
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
