'use strict';

const { OAuth2App } = require('homey-oauth2app');
const SmartThingsOAuth2Client = require('./SmartThingsOAuth2Client');

module.exports = class SmartThingsApp extends OAuth2App {

  static OAUTH2_CLIENT = SmartThingsOAuth2Client;
  static OAUTH2_DEBUG = true;

  // async onInit() {
  //   const settings = await this.homey.settings.getKeys();
  //   console.log('settings', settings);

  //   await super.onInit();
  // }

};
