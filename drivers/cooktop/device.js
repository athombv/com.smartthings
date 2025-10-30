'use strict';

const SmartThingsDevice = require('../../lib/SmartThingsDevice');

module.exports = class SmartThingsDeviceCooktop extends SmartThingsDevice {

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
        if (value === 'on') return true;
        if (value === 'off') return false;
        return null;
      },
    },
    {
      homeyCapabilityId: 'onoff.hood_fan',
      smartThingsComponentId: 'hood',
      smartThingsCapabilityId: 'switch',
      smartThingsAttributeId: 'switch',
      async onSet({ value }) {
        await this.executeCommand({
          component: 'hood',
          capability: 'switch',
          command: value
            ? 'on'
            : 'off',
        });
      },
      async onReport({ value }) {
        if (value === 'on') return true;
        if (value === 'off') return false;
        return null;
      },
    },
    {
      homeyCapabilityId: 'samsung_cooktop_hood_fan_speed',
      smartThingsComponentId: 'hood',
      smartThingsCapabilityId: 'samsungce.hoodFanSpeed',
      smartThingsAttributeId: 'hoodFanSpeed',
      async onSet({ value }) {
        await this.executeCommand({
          component: 'hood',
          capability: 'samsungce.hoodFanSpeed',
          command: 'setHoodFanSpeed',
          args: [value],
        });
      },
    },
    {
      homeyCapabilityId: 'onoff.hood_light',
      smartThingsComponentId: 'hood',
      smartThingsCapabilityId: 'samsungce.lamp',
      smartThingsAttributeId: 'brightnessLevel',
      async onSet({ value }) {
        await this.executeCommand({
          component: 'hood',
          capability: 'samsungce.lamp',
          command: 'setBrightnessLevel',
          args: [
            value
              ? 'mid'
              : 'off',
          ],
        });
      },
      async onReport({ value }) {
        if (value === 'mid') return true;
        if (value === 'off') return false;
        return null;
      },
    },
    {
      homeyCapabilityId: 'samsung_cooktop_burner_power.burner-01',
      smartThingsComponentId: 'burner-01',
      smartThingsCapabilityId: 'samsungce.cooktopHeatingPower',
      smartThingsAttributeId: 'manualLevel',
      async onReport({ value, capability }) {
        if (capability?.manualLevelMax?.value) {
          this.__burner_01_max = capability.manualLevelMax.value;
        }

        if (this.__burner_01_max) {
          return `${value} / ${this.__burner_01_max}`;
        }

        return `${value}`;
      },
    },
    {
      homeyCapabilityId: 'samsung_cooktop_burner_power.burner-02',
      smartThingsComponentId: 'burner-02',
      smartThingsCapabilityId: 'samsungce.cooktopHeatingPower',
      smartThingsAttributeId: 'manualLevel',
      async onReport({ value, capability }) {
        if (capability?.manualLevelMax?.value) {
          this.__burner_01_max = capability.manualLevelMax.value;
        }

        if (this.__burner_01_max) {
          return `${value} / ${this.__burner_01_max}`;
        }

        return `${value}`;
      },
    },
    {
      homeyCapabilityId: 'samsung_cooktop_burner_power.burner-03',
      smartThingsComponentId: 'burner-03',
      smartThingsCapabilityId: 'samsungce.cooktopHeatingPower',
      smartThingsAttributeId: 'manualLevel',
      async onReport({ value, capability }) {
        if (capability?.manualLevelMax?.value) {
          this.__burner_01_max = capability.manualLevelMax.value;
        }

        if (this.__burner_01_max) {
          return `${value} / ${this.__burner_01_max}`;
        }

        return `${value}`;
      },
    },
    {
      homeyCapabilityId: 'samsung_cooktop_burner_power.burner-04',
      smartThingsComponentId: 'burner-04',
      smartThingsCapabilityId: 'samsungce.cooktopHeatingPower',
      smartThingsAttributeId: 'manualLevel',
      async onReport({ value, capability }) {
        if (capability?.manualLevelMax?.value) {
          this.__burner_01_max = capability.manualLevelMax.value;
        }

        if (this.__burner_01_max) {
          return `${value} / ${this.__burner_01_max}`;
        }

        return `${value}`;
      },
    },
    {
      homeyCapabilityId: 'samsung_cooktop_burner_power.burner-05',
      smartThingsComponentId: 'burner-05',
      smartThingsCapabilityId: 'samsungce.cooktopHeatingPower',
      smartThingsAttributeId: 'manualLevel',
      async onReport({ value, capability }) {
        if (capability?.manualLevelMax?.value) {
          this.__burner_01_max = capability.manualLevelMax.value;
        }

        if (this.__burner_01_max) {
          return `${value} / ${this.__burner_01_max}`;
        }

        return `${value}`;
      },
    },
    {
      homeyCapabilityId: 'samsung_cooktop_burner_power.burner-06',
      smartThingsComponentId: 'burner-06',
      smartThingsCapabilityId: 'samsungce.cooktopHeatingPower',
      smartThingsAttributeId: 'manualLevel',
      async onReport({ value, capability }) {
        if (capability?.manualLevelMax?.value) {
          this.__burner_01_max = capability.manualLevelMax.value;
        }

        if (this.__burner_01_max) {
          return `${value} / ${this.__burner_01_max}`;
        }

        return `${value}`;
      },
    },
  ];

};
