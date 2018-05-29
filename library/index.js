const request = require('request');
import moment from 'moment';

const ipstack = ip =>
  `http://api.ipstack.com/${ip}?access_key=${process.env.API_STACK_KEY}&callback=json`;

export const makeIpStackReq = (ipAddress, callback) =>
  request(ipstack(ipAddress), (error, response, body) => {
    // console.log('headers', response.headers);
    if (!error && response.statusCode == 200) {
      callback(body);
    }
});

export const getMonthAgo = () => {
  return moment().subtract(1, 'months').toISOString();
  //let d = new Date();
  //d.setMonth(d.getMonth() - 1);
  //return d.getTime();
};
