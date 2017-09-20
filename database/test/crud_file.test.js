import { expect } from 'chai';
import Helpers from '../lib/helper';

const helpers = new Helpers();
let pool = null;

const params = {
  username: 'testnewuser',
  password: 'password',
};

const file = {
  filename: 'file.txt',
};

let userinfo = null;
let fileInfo = null;
let requiredFileInfo = null;
let updatedFileInfo = null;
let deleteFileInfo = null;

describe('crud_files', () => {
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
  describe('create a new file', () => {
    before(async () => {
      return pool.query('select * from syncollege_db.create_file($1, $2)', [
        userinfo.id,
        file.filename,
      ]).then((res) => {
        fileInfo = res.rows[0];
        return res;
      });
    });
    it('successfully', () => {
      expect(fileInfo.success).to.be.true;
      expect(fileInfo.filename).to.equals(file.filename);
    });
  });

  describe('require created file', () => {
    before(async () => {
      return pool.query('select * from syncollege_db.require_file($1)', [fileInfo.id])
      .then((res) => {
        console.log(res.rows[0]);
        requiredFileInfo = res.rows[0];
        return res;
      });
    });
    it('successfully', () => {
      expect(requiredFileInfo.success).to.be.true;
      expect(fileInfo.id).to.equals(requiredFileInfo.id);
      expect(fileInfo.filename).to.equals(requiredFileInfo.filename);
    });
  });
  describe('update created file title', () => {
    before(async () => {
      return pool.query('select * from syncollege_db.update_file($1, $2, $3)', [
        userinfo.id,
        fileInfo.id,
        `${file.filename}new`,
      ]).then((res) => {
        updatedFileInfo = res.rows[0];
        return res;
      });
    });
    it('successfully', () => {
      expect(updatedFileInfo.success).to.be.true;
      expect(fileInfo.id).to.equals(updatedFileInfo.id);
      expect(`${fileInfo.filename}new`).to.equals(updatedFileInfo.title);
    });
  });
  describe('update created file status', () => {
    before(async () => {
      return pool.query('select * from syncollege_db.set_file_uploaded($1, $2, $3, $4, $5)', [
        userinfo.id,
        fileInfo.id,
        null,
        `${file.snapshot}new`,
        `${file.content}new`,
      ]).then((res) => {
        updatedFileInfo = res.rows[0];
        return res;
      });
    });
    it('successfully', () => {
      expect(updatedFileInfo.success).to.be.true;
      expect(fileInfo.id).to.equals(updatedFileInfo.id);
      expect(`${fileInfo.title}new`).to.equals(updatedFileInfo.title);
      expect(`${fileInfo.snapshot}new`).to.equals(updatedFileInfo.snapshot);
      expect(`${fileInfo.content}new`).to.equals(updatedFileInfo.content);
    });
  });

  describe('delete created file', () => {
    before(async () => {
      return pool.query('select * from syncollege_db.delete_file($1, $2)', [
        userinfo.id,
        fileInfo.id,
      ]).then((res) => {
        deleteFileInfo = res.rows[0];
        return res;
      });
    });
    it('successfully', () => {
      expect(deleteFileInfo.success).to.be.true;
      expect(fileInfo.id).to.equals(deleteFileInfo.id);
    });
  });

  describe('created file can not ne required now', () => {
    before(async () => {
      return pool.query('select * from syncollege_db.require_file($1)', [fileInfo.id]).then((res) => {
        requiredFileInfo = res.rows[0];
        return res;
      });
    });
    it('successfully', () => {
      expect(requiredFileInfo.success).to.be.false;
    });
  });
});
