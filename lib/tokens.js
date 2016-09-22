const stamp = require('stampit');
const req = require('superagent');
const url = require('url');
const debug = require('debug')('zdc-auth');
const assert = require('assert');

module.exports = stamp()
  .methods({
    create(params = {}){
      return new Promise((resolve, reject) => {
        const {client_id, secret} = this;
        const {grant_type, code, redirect_uri} = params;
        const {endpoint} = this;

        try {
          assert(grant_type, 'you forgot to pass grant_type to the params');
        } catch (e) {
          debug(e);
          return reject({status: 422, error_description: e.message});
        }

        const request = req
          .post(url.format(Object.assign({}, endpoint, {pathname: '/tokens'})))
          .auth(client_id, secret)
          .type('form')
          .send({grant_type});

        if (code) {
          request.send({code});
        }
        if (redirect_uri) {
          request.send({redirect_uri});
        }

        request.end(function (err, response) {
          if (err) {
            debug(err);
            const e = {status: err.status};
            const errBody = err.response && err.response.body || {error_description: 'unknown error, please contact support'};
            const {error_description} = errBody;
            return reject(Object.assign(e, {error_description}));
          } else {
            return resolve(response.body);
          }
        });
      });
    },
    self(params = {}){
      return new Promise((resolve, reject)=> {
        const {client_id, secret, endpoint} = this;
        const {token} = params;
        try {
          assert(token, 'you forgot to pass token to the params');
        } catch (e) {
          debug(e);
          return reject({status: 422, error_description: e.message});
        }

        req
          .get(url.format(Object.assign({}, endpoint, {pathname: `/tokens/${token}`})))
          .auth(client_id, secret)
          .end((err, res)=> {
            if (err) {
              debug(err);
              const e = {status: err.status};
              const errBody = err.response && err.response.body || {error_description: 'unknown error, please contact support'};
              const {error_description} = errBody;
              return reject(Object.assign(e, {error_description}));
            }
            resolve(res.body);
          });
      });
    }
  });