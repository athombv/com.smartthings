'use strict';

const { OAuth2Device } = require('homey-oauth2app');

module.exports = class SmartThingsDevice extends OAuth2Device {

  static SYNC_STATUS_INTERVAL = 60 * 60 * 1000; // 1h
  static CAPABILITIES = {
    /*
      homeyCapabilityId: '...',
      smartThingsComponentId: '...',
      smartThingsCapabilityId: '...',
      smartThingsAttributeId: '...',
      async onSet({ value }) {
        await this.oAuth2Client.setFoo({
          value,
        });
      },
      async onReport({ value }) {
        return value;
      },
    */
  };

  async onOAuth2Init() {
    const {
      deviceId,
    } = await this.getData();

    // Register Device for EventSource Events
    await this.oAuth2Client.registerDevice({
      deviceId,
      onEvent: event => this.onEvent(event),
    });

    // Sync status initially and periodically
    this.syncStatus();
    this.syncStatusInterval = this.homey.setInterval(() => {
      this.syncStatus();
    }, this.constructor.SYNC_STATUS_INTERVAL);

    // Bind Capability Listeners
    for (const capabilityObj of Object.values(this.constructor.CAPABILITIES)) {
      if (!capabilityObj.onSet) continue;

      this.registerCapabilityListener(capabilityObj.homeyCapabilityId, async (value, opts) => {
        return capabilityObj.onSet.call(this, {
          value,
          opts,
        });
      });
    }
  }

  async onOAuth2Uninit() {
    // Clear Sync Status Interval
    if (this.syncStatusInterval) {
      this.homey.clearInterval(this.syncStatusInterval);
    }

    // Unregister Device for EventSource Events
    const { deviceId } = await this.getData();
    await this.oAuth2Client.unregisterDevice({
      deviceId,
    }).catch(this.error);
  }

  syncStatus = () => {
    this.log('Synchronizing Status...');

    Promise.resolve().then(async () => {
      const { deviceId } = await this.getData();
      const status = await this.oAuth2Client.getDeviceStatus({ deviceId });
      this.onStatus(status);
    })
      .then(() => this.setAvailable())
      .catch(err => this.setUnavailable(err).catch(this.error));
  }

  onStatus(status) {
    // this.log(JSON.stringify(status, false, 2));

    const { components } = status;
    if (components) {
      for (const [componentId, component] of Object.entries(components)) {
        for (const [capabilityId, capability] of Object.entries(component)) {
          for (const [attributeId, attribute] of Object.entries(capability)) {
            const capabilityObj = this.constructor.CAPABILITIES.find(capability => {
              if (capability.smartThingsComponentId !== componentId) return false;
              if (capability.smartThingsCapabilityId !== capabilityId) return false;
              if (capability.smartThingsAttributeId !== attributeId) return false;
              return true;
            });

            if (capabilityObj) {
              Promise.resolve().then(async () => {
                const value = capabilityObj.onReport
                  ? await capabilityObj.onReport.call(this, {
                    value: attribute.value,
                  })
                  : attribute.value;

                if (value !== undefined) {
                  if (!this.hasCapability(capabilityObj.homeyCapabilityId)) {
                    await this.addCapability(capabilityObj.homeyCapabilityId);
                  }

                  await this.setCapabilityValue(capabilityObj.homeyCapabilityId, value);
                }
              }).catch(err => this.error(`Error Calling ${componentId}.${capabilityId}.${attributeId} onReport: ${err.message}`));
            }
          }
        }
      }
    }
  }

  onEvent(event) {
    // this.log('onEvent', JSON.stringify(event, false, 2));

    const capabilityObj = this.constructor.CAPABILITIES.find(capability => {
      if (capability.smartThingsComponentId !== event.componentId) return false;
      if (capability.smartThingsCapabilityId !== event.capability) return false;
      if (capability.smartThingsAttributeId !== event.attribute) return false;
      return true;
    });

    if (capabilityObj) {
      Promise.resolve().then(async () => {
        const value = capabilityObj.onReport
          ? await capabilityObj.onReport.call(this, {
            value: event.value,
          })
          : event.value;

        if (value !== undefined) {
          if (!this.hasCapability(capabilityObj.homeyCapabilityId)) {
            await this.addCapability(capabilityObj.homeyCapabilityId);
          }

          await this.setCapabilityValue(capabilityObj.homeyCapabilityId, value);
        }
      }).catch(err => this.error(`Error Calling ${event.componentId}.${event.capability}.${event.attribute} onReport: ${err.message}`));
    }
  }

  async executeCommand({
    component,
    capability,
    command,
    args = [],
  }) {
    const { deviceId } = this.getData();

    try {
      await this.oAuth2Client.executeDeviceCommand({
        deviceId,
        component,
        capability,
        command,
        args,
      });
    } catch (err) {
      // 409 is an undocumented error for when a TV is in standby and not connected to WiFi anymore
      if (err.status === 409) {
        throw new Error(this.homey.__('errors.offline'));
      }
      throw (err);
    }
  }

};
