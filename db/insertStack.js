/*

DB INSERT METHOD
  ipAddress: request ip address
  ipstack: serialized api response json obj
  last_updated: postgresql timestamp

*/


export default (db, success, failure) => (ipAddress, body) => db.none(
    'INSERT INTO users(ip_address, ipstack, last_update)' +
    'values($(address), $(stack), CURRENT_DATE)',
    {
      address: `${ipAddress}`,
      stack: `${JSON.stringify(body)}`
    }
  )
    .then(success)
    .catch(failure);
