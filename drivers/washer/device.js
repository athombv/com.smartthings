'use strict';

const SmartThingsDevice = require('../../lib/SmartThingsDevice');

module.exports = class SmartThingsDeviceWasher extends SmartThingsDevice {

  static CAPABILITIES = [
    // Power on/off — reflects physical power button via switch capability
    {
      homeyCapabilityId: 'onoff',
      smartThingsComponentId: 'main',
      smartThingsCapabilityId: 'switch',
      smartThingsAttributeId: 'switch',
      async onSet({ value }) {
        await this.executeCommand({
          component: 'main',
          capability: 'switch',
          command: value ? 'on' : 'off',
        });
      },
      async onReport({ value }) {
        return this.constructor.getBooleanFromOnOff(value);
      },
    },
    // Start cycle button (requires Remote Control enabled on machine)
    {
      homeyCapabilityId: 'samsung_washer_start',
      async onSet() {
        if (this.getCapabilityValue('samsung_washer_remote_control_enabled') !== true) {
          throw new Error(this.homey.__('errors.remote_control_disabled'));
        }

        try {
          await this.executeCommand({
            component: 'main',
            capability: 'washerOperatingState',
            command: 'setMachineState',
            args: ['run'],
          });
        } catch (err) {
          this.error(`setMachineState run failed (${err.message}), trying samsungce start...`);
          await this.executeCommand({
            component: 'main',
            capability: 'samsungce.washerOperatingState',
            command: 'start',
          });
        }
      },
    },
    {
      homeyCapabilityId: 'samsung_washer_progress_percentage',
      smartThingsComponentId: 'main',
      smartThingsCapabilityId: 'samsungce.washerOperatingState',
      smartThingsAttributeId: 'progress',
      async onReport({ value }) {
        return this.constructor.getNumber(value);
      },
    },
    {
      homeyCapabilityId: 'samsung_washer_progress_remaining_time',
      smartThingsComponentId: 'main',
      smartThingsCapabilityId: 'samsungce.washerOperatingState',
      smartThingsAttributeId: 'remainingTimeStr',
      async onReport({ value }) {
        return value ?? undefined;
      },
    },
    {
      homeyCapabilityId: 'samsung_washer_current_job_state',
      smartThingsComponentId: 'main',
      smartThingsCapabilityId: 'samsungce.washerOperatingState',
      smartThingsAttributeId: 'washerJobState',
      async onReport({ value }) {
        const homeyCapabilityId = 'samsung_washer_current_job_state';

        const flowArray = [
          { value: 'finished', flow: 'samsung_washer_job_finished' },
          { value: 'wash', flow: 'samsung_washer_job_started' },
          { value: 'weightSensing', flow: 'samsung_washer_job_weight_sensing' },
          { value: 'preWash', flow: 'samsung_washer_job_pre_wash' },
          { value: 'rinse', flow: 'samsung_washer_job_rinse' },
        ];

        flowArray.forEach(f => {
          if (value === f.value && this.getCapabilityValue(homeyCapabilityId) !== f.value) {
            this.homey.flow.getDeviceTriggerCard(f.flow).trigger(this).catch(this.error);
          }
        });

        if (!value) return undefined;
        return this.getEnumValue(homeyCapabilityId, value);
      },
    },
    // Washing program picker — returns undefined if value can't be parsed to preserve picker position
    {
      homeyCapabilityId: 'samsung_washer_cycle',
      smartThingsComponentId: 'main',
      smartThingsCapabilityId: 'samsungce.washerCycle',
      smartThingsAttributeId: 'washerCycle',
      async onSet({ value }) {
        await this.executeCommand({
          component: 'main',
          capability: 'samsungce.washerCycle',
          command: 'setWasherCycle',
          args: [value],
        });
      },
      async onReport({ value }) {
        if (!value) return undefined;
        const match = String(value).match(/Course_([0-9A-Fa-f]+)$/i);
        if (!match) return undefined;
        return this.getEnumValue('samsung_washer_cycle', match[1].toUpperCase());
      },
    },
    // Remote control status (read-only — enable on machine by pressing Smart Control)
    {
      homeyCapabilityId: 'samsung_washer_remote_control_enabled',
      smartThingsComponentId: 'main',
      smartThingsCapabilityId: 'remoteControlStatus',
      smartThingsAttributeId: 'remoteControlEnabled',
      async onReport({ value }) {
        const newValue = this.constructor.getBooleanFromSmartThings(value);

        if (newValue !== undefined) {
          const homeyCapabilityId = 'samsung_washer_remote_control_enabled';
          const previousValue = this.getCapabilityValue(homeyCapabilityId);
          if (newValue === true && previousValue !== true) {
            this.homey.flow.getDeviceTriggerCard('samsung_washer_remote_control_enabled_true').trigger(this).catch(this.error);
          } else if (newValue === false && previousValue !== false) {
            this.homey.flow.getDeviceTriggerCard('samsung_washer_remote_control_enabled_false').trigger(this).catch(this.error);
          }
        }
        return newValue;
      },
    },
    // Power (W)
    {
      homeyCapabilityId: 'measure_power',
      smartThingsComponentId: 'main',
      smartThingsCapabilityId: 'powerConsumptionReport',
      smartThingsAttributeId: 'powerConsumption',
      async onReport({ value }) {
        return this.constructor.getPowerConsumptionValue(value, 'power');
      },
    },
    // Energy (kWh) — powerConsumption.energy is in Wh
    {
      homeyCapabilityId: 'meter_power',
      smartThingsComponentId: 'main',
      smartThingsCapabilityId: 'powerConsumptionReport',
      smartThingsAttributeId: 'powerConsumption',
      async onReport({ value }) {
        return this.constructor.getPowerConsumptionValue(value, 'energy', 1000);
      },
    },
    // Water consumption (m³) — cumulativeAmount is in mL
    {
      homeyCapabilityId: 'meter_water',
      smartThingsComponentId: 'main',
      smartThingsCapabilityId: 'samsungce.waterConsumptionReport',
      smartThingsAttributeId: 'waterConsumption',
      async onReport({ value }) {
        return this.constructor.getPowerConsumptionValue(value, 'cumulativeAmount', 1000000);
      },
    },
    // Detergent level
    {
      homeyCapabilityId: 'samsung_washer_auto_detergent_status',
      smartThingsComponentId: 'main',
      smartThingsCapabilityId: 'samsungce.autoDispenseDetergent',
      smartThingsAttributeId: 'remainingAmount',
      async onReport({ value }) {
        return value || undefined;
      },
    },
    // Softener level
    {
      homeyCapabilityId: 'samsung_washer_auto_softener_status',
      smartThingsComponentId: 'main',
      smartThingsCapabilityId: 'samsungce.autoDispenseSoftener',
      smartThingsAttributeId: 'remainingAmount',
      async onReport({ value }) {
        return value || undefined;
      },
    },
  ];

};
