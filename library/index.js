const request = require('request');

const ipstack = ip =>
  `http://api.ipstack.com/${ip}?access_key=${process.env.API_STACK_KEY}&callback=json`;

export const makeIpStackReq = (ipAddress, callback) =>
  request(ipstack(ipAddress), (error, response, body) => {
    console.log(response);
    if (!error && response.statusCode == 200) {
      callback(body);
    }
});
