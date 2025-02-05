/* eslint-disable camelcase */

'use strict';

const { OAuth2Token } = require('homey-oauth2app');

module.exports = class SmartThingsOAuth2Token extends OAuth2Token {

  constructor({
    client_id,
    client_secret,
    ...props
  }) {
    super({ ...props });

    this.client_id = client_id;
    this.client_secret = client_secret;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      client_id: this.client_id,
      client_secret: this.client_secret,
    };
  }

};
