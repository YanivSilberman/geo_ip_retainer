const express = require('express');
const router = express.Router();
const CronJob = require('cron').CronJob;

// IMPORT DB METHODS
import controllers from '../db/controllers/user.ctrl';
import { makeIpStackReq } from '../library';

// DEFAULT INDEX ROUTE

router.get('/', (req, res, next) => {

  // Get request ip address
  let ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  if (ipAddress.substr(0, 7) == "::ffff:") ipAddress = ipAddress.substr(7);

  // general return functions
  const success = geo => data => {
    console.log('success', geo);
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
    const timestamp = new Date().getTime() + (30 * 24 * 60 * 60 * 1000);
    const newDate = new Date().getTime(last_update);

    // if 30 days have passed
    if (timestamp < newDate) {
      // fetch from api, then update in db
      makeIpStackReq(
        ipAddress,
        body => controllers(
          success(body),
          failure('More than 30s passed, db update failed')
        ).updateUser(_id, {
          ipstack: JSON.stringify(body),
          last_update: new Date().getTime()
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
        last_update: new Date().getTime()
      }));
  };

  // run query
  controllers(ifFound, ifNotFound).getUserByIp(ipAddress);
});

// timer runs every day, batch updates all expired rows

new CronJob('00 00 * * * *', () => {
  // runs every day at LA Midnight
  const onQuerySuccess = data => {
    // chain ip addresses from all expired
    const addresses = data.reduce((a,b) => a.ip_address + "," + b.ip_address);
    makeIpStackReq(addresses, body => {

      const c = controllers(()=>null,()=>null);

      for (let i in body) {
        c.updateUser(data[i]._id, {
          ipstack: JSON.stringify(body[i]),
          last_update: new Date().getTime()
        })
      }

      return dbMethods([d => d]).batchUpdate(values);
    })
  };

  // run db query
  let d = new Date();
  d.setMonth(d.getMonth() - 1);
  controllers(onQuerySuccess).getExpiredUsers(d.getTime());

}, null, true, 'America/Los_Angeles');

module.exports = router;
