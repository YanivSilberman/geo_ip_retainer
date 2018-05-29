const express = require('express');
const router = express.Router();
const CronJob = require('cron').CronJob;
import moment from 'moment';

/*

set request headers = to api call

*/

// IMPORT DB METHODS
import controllers from '../db/controllers/user.ctrl';
import { makeIpStackReq, getMonthAgo } from '../library';

// DEFAULT INDEX ROUTE

router.get('/', (req, res, next) => {

  // Get request ip address
  let ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  if (ipAddress.substr(0, 7) == "::ffff:") ipAddress = ipAddress.substr(7);

  // general return functions
  const success = geo => data => {
    res.set('Content-Type', 'text/json');
    res.status(200).json(geo);
    return data;
  };

  const failure = msg => err => res.status(200).send({
    message: msg,
    error: err
  });

  // if found ip in DB callback
  const ifFound = data => {
    const { _id, last_update, ipstack } = data;
    const monthAgo = getMonthAgo();
    const newDate = moment(last_update);

    // if 30 days have passed
    if (newDate.isBefore(monthAgo)) {
      // fetch from api, then update in db
      makeIpStackReq(
        ipAddress,
        body => controllers(
          success(body),
          failure('More than 30s passed, db update failed')
        ).updateUser(_id, {
          ipstack: JSON.stringify(body),
          last_update: moment().toISOString()
        })
      );
    } else {
      success((JSON.parse(ipstack)))();
    }
  };

  // not found
  const ifNotFound = err => {
    // fetch from api, add new to db
    makeIpStackReq(
      ipAddress,
      body => controllers(
        success(body),
        failure('New IP, error saving geo location')
      ).insertUser({
        ip_address: ipAddress,
        ipstack: JSON.stringify(body),
        last_update: moment().toISOString()
      }));
  };

  // run query
  controllers(ifFound, ifNotFound).getUserByIp(ipAddress);
});

// timer runs every day, batch updates all expired rows

const updateAllExpired = () => {
  console.log('updating all expired');

  const returnVoid = () => null;

  // runs every day at LA Midnight
  const onQuerySuccess = data => {
    for (let user of data) {
      const { ip_address, _id } = user;
      makeIpStackReq(ip_address, body => {
        // this runs in background
        controllers(returnVoid, returnVoid)
          .updateUser(_id, {
            ipstack: JSON.stringify(body),
            last_update: moment().toISOString()
          });
      })
    }
  };

  // run db query
  controllers(onQuerySuccess, returnVoid)
    .getExpiredUsers(getMonthAgo());
}

new CronJob('00 00 * * * *', () => {
  console.log('running cron jobs test, once a day');
  updateAllExpired()
}, null, true, 'America/Los_Angeles');

module.exports = router;
