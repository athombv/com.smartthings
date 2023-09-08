/* eslint-disable camelcase */

'use strict';

const { OAuth2Token } = require('homey-oauth2app');

module.exports = class SmartThingsOAuth2Token extends OAuth2Token {

  constructor({
    access_token,
  }) {
    super({});

    this.access_token = access_token;
  }

  toJSON() {
    return {
      access_token: this.access_token,
    };
  }

};
