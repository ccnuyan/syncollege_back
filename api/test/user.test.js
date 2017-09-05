import { expect } from 'chai';
import request from 'supertest';

import developer from '../../database/lib/developer';
import server from './testServer';

const loginInfo = {
  username: 'ccnuyan',
  password: 'password',
};

const registerInfo = {
  username: 'testuser',
  password: 'testpass',
};

let app;

describe('POST /api/user/authenticate', () => {
  before(async function init() {
    this.timeout(10000);
    app = await server();
    await developer.install();
    return Promise.resolve();
  });

  it('authenticated successfully with correct credential', (done) => {
    request(app)
      .post('/api/user/authenticate')
      .send(loginInfo)
      .set('Accept', 'application/json')
      .end((err, res) => {
        if (err) { return done(err); }
        expect(res.body.success).to.be.true;
        expect(res.body.username).to.equal(loginInfo.username);
        done();
      });
  });

  it('authenticated unsuccessfully with incorrect credential', (done) => {
    request(app)
      .post('/api/user/authenticate')
      .send({ username: 'ccnuyan', password: 'nimmaa' })
      .set('Accept', 'application/json')
      .end((err, res) => {
        if (err) { return done(err); }
        expect(res.body.success).to.be.false;
        expect(res.body.username).to.be.undefined;
        done();
      });
  });

  it('register successfully', (done) => {
    request(app)
      .post('/api/user/register')
      .send(registerInfo)
      .set('Accept', 'application/json')
      .end((err, res) => {
        if (err) { return done(err); }
        expect(res.body.success).to.be.true;
        expect(res.body.username).to.equal(registerInfo.username);
        done();
      });
  });

  it('register with same username', (done) => {
    request(app)
      .post('/api/user/register')
      .send(registerInfo)
      .set('Accept', 'application/json')
      .end((err, res) => {
        if (err) { return done(err); }
        expect(res.body.success).to.be.false;
        done();
      });
  });
});
