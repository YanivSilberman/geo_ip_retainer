const request = require('request');
import moment from 'moment';

const ipstack = ip =>
  `http://api.ipstack.com/${ip}?access_key=${process.env.API_STACK_KEY}&callback=json`;

const extractJson = jsonp => {
  let json;
  try {
    json = JSON.parse(jsonp)
  } catch(err) {
    let startPos = jsonp.indexOf('({');
    let endPos = jsonp.indexOf('})');
    let jsonString = jsonp.substring(startPos+1, endPos+1);
    json = JSON.parse(jsonString);
  }

  return json;
}

export const makeIpStackReq = (ipAddress, callback) =>
  request(ipstack(ipAddress), (error, response, body) => {
    const json = extractJson(body);
    if (!error && response.statusCode == 200) {
      callback(json);
    }
});

export const getMonthAgo = () => moment()
  .subtract(1, 'months').toISOString();
