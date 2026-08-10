'use strict';

const SmartThingsDevice = require('../../lib/SmartThingsDevice');

module.exports = class SmartThingsDeviceTV extends SmartThingsDevice {

  // Samsung TV energy reports are not reliably pushed as webhook events. Poll
  // often enough to receive the rolling usage values that SmartThings exposes.
  static SYNC_STATUS_INTERVAL = 5 * 60 * 1000; // 5 min

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
      homeyCapabilityId: 'channel_up',
      smartThingsComponentId: 'main',
      smartThingsCapabilityId: 'tvChannel',
      async onSet() {
        await this.executeCommand({
          component: 'main',
          capability: 'tvChannel',
          command: 'channelUp',
        });
      },
    },
    {
      homeyCapabilityId: 'channel_down',
      smartThingsComponentId: 'main',
      smartThingsCapabilityId: 'tvChannel',
      async onSet() {
        await this.executeCommand({
          component: 'main',
          capability: 'tvChannel',
          command: 'channelDown',
        });
      },
    },
    // Power (W)
    {
      homeyCapabilityId: 'measure_power',
      smartThingsComponentId: 'main',
      smartThingsCapabilityId: 'powerConsumptionReport',
      smartThingsAttributeId: 'powerConsumption',
      async onReport({ value }) {
        return this.getPowerValue(value);
      },
    },
    // Energy (kWh) — powerConsumption.energy is in Wh
    {
      homeyCapabilityId: 'meter_power',
      smartThingsComponentId: 'main',
      smartThingsCapabilityId: 'powerConsumptionReport',
      smartThingsAttributeId: 'powerConsumption',
      async onReport({ value }) {
        return this.getEnergyValue(value);
      },
    },
  ];

  getPowerValue(value) {
    const reportedPower = this.constructor.getPowerConsumptionValue(value, 'power');
    const reportedEnergy = this.constructor.getPowerConsumptionValue(value, 'energy');
    const deltaEnergy = this.constructor.getPowerConsumptionValue(value, 'deltaEnergy');

    this.log('TV powerConsumptionReport', JSON.stringify(value));

    if (reportedPower && reportedPower > 0) return reportedPower;

    const start = Date.parse(value?.start);
    const end = Date.parse(value?.end);
    const durationHours = (end - start) / (60 * 60 * 1000);
    if (deltaEnergy && deltaEnergy > 0 && Number.isFinite(durationHours) && durationHours > 0) {
      return deltaEnergy / durationHours;
    }

    if (reportedEnergy === undefined) return reportedPower;

    const now = Date.now();
    const previousSample = this._powerConsumptionSample;
    this._powerConsumptionSample = {
      energy: reportedEnergy,
      time: now,
    };

    if (!previousSample) return reportedPower;

    const energyDelta = reportedEnergy - previousSample.energy;
    const timeDeltaHours = (now - previousSample.time) / (60 * 60 * 1000);
    if (energyDelta <= 0 || timeDeltaHours <= 0) return reportedPower;

    return energyDelta / timeDeltaHours;
  }

  getEnergyValue(value) {
    this._energyUpdate = (this._energyUpdate || Promise.resolve())
      .then(() => this.updateEnergyValue(value));
    return this._energyUpdate;
  }

  async updateEnergyValue(value) {
    const reportedEnergy = this.constructor.getPowerConsumptionValue(value, 'energy');
    if (reportedEnergy && reportedEnergy > 0) {
      this._lastMeterPower = reportedEnergy / 1000;
      return this._lastMeterPower;
    }

    const deltaEnergy = this.constructor.getPowerConsumptionValue(value, 'deltaEnergy');
    const end = typeof value?.end === 'string' ? value.end : undefined;
    const currentMeterValue = this.constructor.getNumber(this.getCapabilityValue('meter_power')) || 0;
    const previousMeterValue = this._lastMeterPower ?? currentMeterValue;

    if (!end || !deltaEnergy || deltaEnergy <= 0) return previousMeterValue;

    if (this.getStoreValue('tvPowerConsumptionEnd') === end) return previousMeterValue;

    await this.setStoreValue('tvPowerConsumptionEnd', end);
    this._lastMeterPower = previousMeterValue + (deltaEnergy / 1000);
    return this._lastMeterPower;
  }

  // We haven't found a TV that supports the `samsungTV` capability yet.
  // onFlowActionShowMessage = async ({ message }) => {
  //   const { deviceId } = this.getData();
  //   await this.oAuth2Client.executeDeviceCommand({
  //     deviceId,
  //     component: 'main',
  //     capability: 'samsungTV',
  //     command: 'showMessage',
  //     args: [message],
  //   });
  // }

};
