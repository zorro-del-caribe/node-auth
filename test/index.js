const test = require('tape');
const nock = require('nock');
const sdk = require('../index')();

test('get token details', t=> {
  const zdcauth = nock('https://auth.zdc.com')
    .get('/tokens/foo')
    .basicAuth({
      user: 'john',
      pass: 'doe'
    })
    .reply(200, {
      id: 'id',
      token: 'foo',
      expires_in: 123,
      revoked: false,
      scope: {
        type: 'user',
        target: 'foo@bar.com'
      }
    });

  sdk
    .tokens({client_id: 'john', secret: 'doe'})
    .self({token: 'foo'})
    .then(res=> {
      t.deepEqual(res, {
        id: 'id',
        token: 'foo',
        expires_in: 123,
        revoked: false,
        scope: {
          type: 'user',
          target: 'foo@bar.com'
        }
      });
      t.ok(zdcauth.isDone());
      t.end();
    })
    .catch(err=>t.end(err));
});

test('forward error', t=> {
  const zdcauth = nock('https://auth.zdc.com')
    .get('/tokens/foo')
    .basicAuth({
      user: 'john',
      pass: 'doe'
    })
    .reply(404, {
      error_description: 'could not find the token info'
    });

  sdk
    .tokens({client_id: 'john', secret: 'doe'})
    .self({token: 'foo'})
    .then(res=> {
      t.fail();
    })
    .catch(err=> {
      t.equal(err.status, 404);
      t.equal(err.error_description, 'could not find the token info');
      t.end();
    });
});

test('create token', t=> {
  const zdcauth = nock('https://auth.zdc.com')
    .post('/tokens', 'grant_type=client_credentials')
    .basicAuth({
      user: 'john',
      pass: 'doe'
    })
    .reply(200, {
      id: 'id',
      token: 'foo',
      expires_in: 123,
      revoked: false,
      scope: {
        type: 'user',
        target: 'foo@bar.com'
      }
    });

  sdk
    .tokens({client_id: 'john', secret: 'doe'})
    .create({grant_type: 'client_credentials'})
    .then(res=> {
      t.deepEqual(res, {
        id: 'id',
        token: 'foo',
        expires_in: 123,
        revoked: false,
        scope: {
          type: 'user',
          target: 'foo@bar.com'
        }
      });
      t.ok(zdcauth.isDone());
      t.end();
    })
    .catch(err=>t.end(err));
});


test('create token: forward error', t=> {
  const zdcauth = nock('https://auth.zdc.com')
    .post('/tokens', 'grant_type=clientsss_credentials')
    .basicAuth({
      user: 'john',
      pass: 'doe'
    })
    .reply(422, {error_description: 'invalid grant type'});

  sdk
    .tokens({client_id: 'john', secret: 'doe'})
    .create({grant_type: 'clientsss_credentials'})
    .then(()=> {
      t.fail();
    })
    .catch(err=> {
      t.equal(err.status, 422);
      t.equal(err.error_description, 'invalid grant type');
      t.end();
    });
});