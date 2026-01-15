/* eslint-disable camelcase */

'use strict';

const { OAuth2Token } = require('homey-oauth2app');

module.exports = class SmartThingsOAuth2Token extends OAuth2Token {

  constructor({
    app_id,
    app_name,
    client_id,
    client_secret,
    scope,
    installed_app_id,
    access_tier,
    ...props
  }) {
    super({ ...props });

    this.app_id = app_id;
    this.app_name = app_name;
    this.client_id = client_id;
    this.client_secret = client_secret;

    this.scope = scope;
    this.access_tier = access_tier;
    this.installed_app_id = installed_app_id;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      app_id: this.app_id,
      app_name: this.app_name,
      client_id: this.client_id,
      client_secret: this.client_secret,
      scope: this.scope,
      access_tier: this.access_tier,
      installed_app_id: this.installed_app_id,
    };
  }

};
