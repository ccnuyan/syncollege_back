import { expect } from 'chai';
import Helpers from '../lib/helper';

const helpers = new Helpers();
let pool = null;

const params = {
  username: 'testnewuser',
  password: 'password',
};

const work = {
  title: 'work title',
  snapshot: 'work snapshot',
  content: 'work content',
};

let userinfo = null;
let workInfo = null;
let requiredWorkInfo = null;
let updatedWorkInfo = null;
let deleteWorkInfo = null;

describe('crud_works', () => {
  before(async function init() {
    this.timeout(10000);
    pool = await helpers.initDb();

    await pool.query('select * from syncollege_db.register($1, $2)', [
      params.username,
      params.password,
    ]).then((res) => {
      userinfo = res.rows[0];
      return userinfo;
    });
  });
  describe('create a new work', () => {
    before(async () => {
      return pool.query('select * from syncollege_db.create_work($1, $2, $3, $4)', [
        userinfo.id,
        work.title,
        work.snapshot,
        work.content,
      ]).then((res) => {
        workInfo = res.rows[0];
        return res;
      });
    });
    it('successfully', () => {
      expect(workInfo.success).to.be.true;
      expect(workInfo.title).to.equals(work.title);
      expect(workInfo.snapshot).to.equals(work.snapshot);
      expect(workInfo.content).to.equals(work.content);
    });
  });

  describe('require created work', () => {
    before(async () => {
      return pool.query('select * from syncollege_db.require_work($1, $2)', [
        userinfo.id,
        workInfo.id,
      ]).then((res) => {
        requiredWorkInfo = res.rows[0];
        return res;
      });
    });
    it('successfully', () => {
      expect(requiredWorkInfo.success).to.be.true;
      expect(workInfo.id).to.equals(requiredWorkInfo.id);
      expect(workInfo.title).to.equals(requiredWorkInfo.title);
      expect(workInfo.snapshot).to.equals(requiredWorkInfo.snapshot);
      expect(workInfo.content).to.equals(requiredWorkInfo.content);
    });
  });
  describe('update created work title', () => {
    before(async () => {
      return pool.query('select * from syncollege_db.update_work($1, $2, $3)', [
        userinfo.id,
        workInfo.id,
        `${work.title}new`,
      ]).then((res) => {
        updatedWorkInfo = res.rows[0];
        return res;
      });
    });
    it('successfully', () => {
      expect(updatedWorkInfo.success).to.be.true;
      expect(workInfo.id).to.equals(updatedWorkInfo.id);
      expect(`${workInfo.title}new`).to.equals(updatedWorkInfo.title);
      expect(workInfo.snapshot).to.equals(updatedWorkInfo.snapshot);
      expect(workInfo.content).to.equals(updatedWorkInfo.content);
    });
  });
  describe('update created work snapshot and content', () => {
    before(async () => {
      return pool.query('select * from syncollege_db.update_work($1, $2, $3, $4, $5)', [
        userinfo.id,
        workInfo.id,
        null,
        `${work.snapshot}new`,
        `${work.content}new`,
      ]).then((res) => {
        updatedWorkInfo = res.rows[0];
        return res;
      });
    });
    it('successfully', () => {
      expect(updatedWorkInfo.success).to.be.true;
      expect(workInfo.id).to.equals(updatedWorkInfo.id);
      expect(`${workInfo.title}new`).to.equals(updatedWorkInfo.title);
      expect(`${workInfo.snapshot}new`).to.equals(updatedWorkInfo.snapshot);
      expect(`${workInfo.content}new`).to.equals(updatedWorkInfo.content);
    });
  });

  describe('delete created work', () => {
    before(async () => {
      return pool.query('select * from syncollege_db.delete_work($1, $2)', [
        userinfo.id,
        workInfo.id,
      ]).then((res) => {
        deleteWorkInfo = res.rows[0];
        return res;
      });
    });
    it('successfully', () => {
      expect(deleteWorkInfo.success).to.be.true;
      expect(workInfo.id).to.equals(deleteWorkInfo.id);
    });
  });

  describe('created work can not ne required now', () => {
    before(async () => {
      return pool.query('select * from syncollege_db.require_work($1, $2)', [
        userinfo.id,
        workInfo.id,
      ]).then((res) => {
        requiredWorkInfo = res.rows[0];
        return res;
      });
    });
    it('successfully', () => {
      expect(requiredWorkInfo.success).to.be.false;
    });
  });
});
