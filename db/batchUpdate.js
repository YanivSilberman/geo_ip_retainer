/*

DB UPDATE METHOD
  updates all rows in that expired

*/

export default (db, success) => values => db.any(
  'UPDATE users as u SET ' +
  'last_update = CURRENT_DATE, ipstack = u2.ipstack ' +
  `from (values ${values} ) as u2(id, ipstack) where u2.id = u.id ` +
  'RETURNING *;',
).then(success);
