/*

DB UPDATE METHOD
  gets user by ip_address

*/

const queryString = 'select * from users where ip_address = $1';

export default (db, success, failure) => ipAddress =>
  db.one(queryString, ipAddress)
    .then(success)
    .catch(failure);
