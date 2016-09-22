const tokens = require('./lib/tokens');
const stampit = require('stampit');
const assert = require('assert');

module.exports = function (defaultOptions = {
  endpoint: {protocol: 'https', hostname: 'auth.zdc.com'}
}) {
  return {
    tokens: tokens.compose(
      stampit()
        .init(function () {
          const {client_id, secret, endpoint} = Object.assign({}, defaultOptions, this);

          assert(client_id, 'you forgot to pass the client_id to the tokens factory');
          assert(secret, 'you forgot to pass the secret to the tokens factory');

          Object.defineProperty(this, 'client_id', {value: client_id});
          Object.defineProperty(this, 'secret', {value: secret});
          Object.defineProperty(this, 'endpoint', {value: endpoint});
        }))
  }
};