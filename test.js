require('dotenv').config();
const sinon = require('sinon');
require('sinon-mongoose');
const expect = require('chai').expect;

import User from './db/models/User';
import controllers from './db/controllers/user.ctrl';

describe('query all IP addresses', () => {
  it('should query all users and return array of ips', done => {
    const UserMock = sinon.mock(User);
    const expectedResult = {status: true, users: []};
    UserMock.expects('find').yields(null, expectedResult);
    User.find((err, result) => {
        UserMock.verify();
        UserMock.restore();
        expect(result.status).to.be.true;
        done();
    });
  });
});


// TEST GET STACK QUERY
describe('query by IP address', () => {
  it('should find one with an existing ip and decline one without', done => {
    const UserMock = sinon.mock(User);
    const expectedResult = {status: true};
    UserMock.expects('findById').yields(null, expectedResult);
    User.findById((err, result) => {
        UserMock.verify();
        UserMock.restore();
        expect(result.status).to.be.true;
        done();
    });

  });
});



// TEST INSERT STACK
describe('insert new row', () => {
  it('should insert a new row', done => {
    const UserMock = sinon.mock(
      new User({ user: 'Save new user from mock'})
    );
    const user = UserMock.object;
    const expectedResult = { status: true };
    UserMock.expects('save').yields(null, expectedResult);
    user.save((err, result) => {
      UserMock.verify();
      UserMock.restore();
      expect(result.status).to.be.true;
      done();
    });
  });
});


// TEST PUT STACK
describe('put new row', () => {
  it('should put a new row and fail to put second row with fake id', done => {
    const UserMock = sinon.mock(new User({ last_update: new Date().getTime() }));
    const user = UserMock.object;
    const expectedResult = { status: true };
    const args = {_id: 12345};
    UserMock.expects('save').withArgs(args).yields(null, expectedResult);
    user.save(args, (err, result) => {
      UserMock.verify();
      UserMock.restore();
      expect(result.status).to.be.true;
      done();
    });
  });
});



// TEST GET EXPIRED
describe('get rows last updated > 30 days ago', () => {
  it('should only get all updated over a month ago', done => {
    let d = new Date();
    d.setMonth(d.getMonth() - 1);
    const UserMock = sinon.mock(User);
    const expectedResult = {status: true, users: []};
    const args = { last_update : { $lt: d.getTime() }};
    UserMock.expects('find').withArgs(args).yields(null, expectedResult);
    User.find(args, (err, result) => {
        UserMock.verify();
        UserMock.restore();
        expect(result.status).to.be.true;
        done();
    });
  });
});

/*
// TEST BATCH UPDATE
describe('batch update from array', () => {
  it('should update all rows by array', async () => {
    // create new rows
    const arr = Array(5).fill({address: "", stack: ""});
    let i, id, ids = [];
    // create mock rows and return ids for each
    for (i in arr) {
      const { address, stack } = arr[i];
      id = await db.one(
          'INSERT INTO users(ip_address, ipstack, last_update)' +
          `values($(address), $(stack), CURRENT_DATE)` +
          'RETURNING id',
          {address, stack}
        ).then(d => d.id);
      ids[i] = id;
    }

    // change stack data
    const newStack = "newstack";
    const newArr = arr.map(a => {
      a.stack = newStack;
      return a;
    });

    // prepare values string
    const values = newArr
      .map((x, i) => ({ id: ids[i], stack: x.stack }))
      .reduce((a,b,i) => {
      console.log('i', i);
      if (i === 1) {
        return `(${a.id}, '${a.stack}'), (${b.id}, '${b.stack}')`;
      } else {
        return `${a}, (${b.id}, '${b.stack}')`
      }
    });

    const methods = dbMethods([d => d]);
    const update = await methods.batchUpdate(values);

    // all new data's stack to be
    expect(update.map(i => i.id).sort()).to.deep.equal(ids.sort());

    // clear
    for (i of ids) {
      db.none('DELETE FROM users WHERE id = $1', i);
    }
  });
});
*/
