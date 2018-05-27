const express = require('express');
const router = express.Router();
const CronJob = require('cron').CronJob;

// IMPORT DB METHODS
import dbMethods from '../db';
import db from '../db/config';

import { makeIpStackReq } from '../library';

// DEFAULT INDEX ROUTE

router.get('/', (req, res, next) => {

  // Get request ip address
  let ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  if (ipAddress.substr(0, 7) == "::ffff:") ipAddress = ipAddress.substr(7);

  // general return functions
  const success = (msg, ip, geo) => () =>
    res.status(200).render('index', { 'title': msg, ip, geo });
  const failure = msg => () =>
    res.status(200).render('error', { 'title': msg });

  // if found ip in DB callback
  const ifFound = data => {
    const { id, last_update } = data;
    const timestamp = new Date().getTime() + (30 * 24 * 60 * 60 * 1000);
    const newDate = new Date().getTime(last_update);

    // if 30 days have passed
    if (timestamp < newDate) {
      // fetch from api, then update in db
      makeIpStackReq(
        ipAddress,
        body => dbMethods([
          success('More than 30s passed, updated database', ipAddress, body),
          failure('More than 30s passed, db update failed')
        ]).putStack(id, body)
      );
    } else {
      success('IP stored, less than 30 days have passed', ipAddress, JSON.parse(data.ipstack))();
    }
  };

  // not found
  const ifNotFound = err => {
    // fetch from api, add new to db
    makeIpStackReq(
      ipAddress,
      body => dbMethods([
        success('New IP, geo location saved', ipAddress, body),
        failure('New IP, error saving geo location')
      ]).insertStack(ipAddress, body));
  };

  // run query
  dbMethods([ifFound, ifNotFound]).getStack(ipAddress);

});

// timer runs every day, batch updates all expired rows

new CronJob('00 00 * * * *', () => {
  // runs every day at LA Midnight
  const onQuerySuccess = data => {
    // chain ip addresses from all expired
    const addresses = data.reduce((a,b) => a.ip_address + "," + b.ip_address);
    makeIpStackReq(addresses, body => {

      // desired format: `(1, ipstack), (2, ipstack)`
      const values = body
        .map((x, i) => ({ id: data[i].id, stack: x.stack }))
        .reduce((a,b,i) => {
        if (i === 1) {
          return `(${a.id}, '${JSON.stringify(a.stack)}'), (${b.id}, '${JSON.stringify(b.stack)}')`;
        } else {
          return `${a}, (${b.id}, '${JSON.stringify(b.stack)}')`
        }
      });

      return dbMethods([d => d]).batchUpdate(values);
    })
  };

  // run db query
  dbMethods([onQuerySuccess]).getExpired();

}, null, true, 'America/Los_Angeles');

module.exports = router;
