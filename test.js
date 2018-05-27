require('dotenv').config();
const expect = require('chai').expect;
import dbMethods from './db';
import db from './db/config';

const SUCCESS = 'SUCCESS';
const FAILURE = 'FAILURE';

const successCallback = () => SUCCESS;
const failureCallback = () => FAILURE;

// TEST GET STACK QUERY
describe('query by IP address', () => {
  it('should find one with an existing ip and decline one without', async () => {

    const goodIp = "::1";
    const badIp = "1234";

    const methods = dbMethods([successCallback, failureCallback]);

    const good = await methods.getStack(goodIp);
    const bad = await methods.getStack(badIp);

    expect(good).to.be.equal(SUCCESS);
    expect(bad).to.be.equal(FAILURE);

  });
});


// TEST INSERT STACK
describe('insert new row', () => {
  it('should insert a new row', async () => {
    const fakeIp = "1234567";
    const fakeBody = "test";

    const methods = dbMethods([successCallback, failureCallback]);

    const insert = await methods.insertStack(fakeIp, fakeBody);
    const data = await db.one('select ip_address from users where ip_address = $1', fakeIp).then(d => d);

    expect(insert).to.be.equal(SUCCESS);
    expect(data.ip_address).to.be.equal(fakeIp);

    // clear
    db.none('DELETE FROM users WHERE ip_address = $1', fakeIp);
  });
});


// TEST PUT STACK
describe('put new row', () => {
  it('should put a new row and fail to put second row with fake id', async () => {
    const fakeId = "-1";
    const address = "123456";
    const stack = "fake";
    const putStack = "flake";

    // create mock row
    const newRowId = await db.one(
        'INSERT INTO users(ip_address, ipstack, last_update) ' +
        'values($(address), $(stack), CURRENT_DATE) ' +
        'RETURNING id;',
        {address, stack}
      )
      .then(({id}) => id)
      .catch(err => console.log('err', err));

    const methods = dbMethods([
      d => d.ip_stack,
      err => {console.log('err', err); return FAILURE}
    ]);

    // run methods
    const goodPut = await methods.putStack(newRowId, putStack);
    const badPut = await methods.putStack(fakeId, stack);

    const data = await db.one('select ipstack from users where id = $1', newRowId).then(d => d.ipstack);

    expect(JSON.parse(data)).to.be.equal(putStack);
    expect(badPut).to.be.equal(FAILURE);

    // clear
    db.none('DELETE FROM users WHERE id = $1', newRowId);
  });
});


// TEST GET EXPIRED
describe('get rows last updated > 30 days ago', () => {
  it('should only get all updated over a month ago', async () => {
    const address = "fake";
    const stack = "fake";

    // create mock rows
    const createMock = date => db.one(
      'INSERT INTO users(ip_address, ipstack, last_update)' +
      `values($(address), $(stack), ${date}) ` +
      'RETURNING id',
      {address, stack}
    ).then(d => d.id);

    // months ago
    const past_id = await createMock("CURRENT_DATE - interval '31 days'");

    // get
    const methods = dbMethods([d => d]);
    const goodGet = await methods.getExpired();

    expect(goodGet.map(i => i.id)).to.include(past_id);

    // clear
    db.none('DELETE FROM users WHERE id = $1', past_id);
  });
});

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
