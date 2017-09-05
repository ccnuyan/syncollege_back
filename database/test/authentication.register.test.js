import { expect } from 'chai';
import Helpers from '../lib/helper';

const helpers = new Helpers();
let pool = null;

const params = {
  username: 'testnewuser',
  password: 'password',
};


describe('registration', () => {
  before(async function init() {
    this.timeout(10000);
    pool = await helpers.initDb();
  });
  describe('with valid creds', () => {
    let regResult = null;
    before(async () => {
      return pool.query('select * from membership.register($1, $2)', [
        params.username,
        params.password,
      ]).then((res) => {
        regResult = res.rows[0];
        return regResult;
      });
    });
    it('is successful', () => {
      expect(regResult.success).to.be.true;
    });
    it('returns a new id', () => {
      expect(regResult.id).to.not.be.null;
    });
    it('return a role', () => {
      expect(regResult.role).to.equal(10);
    });
    it('returns correct username', () => {
      expect(regResult.username).to.equal(params.username);
    });
  });
  describe('trying an existing user', () => {
    let regResult = null;
    before(async () => {
      return pool.query('select * from membership.register($1, $2)', [
        params.username,
        params.password,
      ]).then((res) => {
        regResult = res.rows[0];
        return regResult;
      });
    });
    it('is not successful', () => {
      expect(regResult.success).to.be.false;
    });
  });
});
