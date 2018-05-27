/*

DB UPDATE METHOD
  gets all rows with last_update older than 30 days

*/

export default (db, success) => () => db.any(
  "SELECT * FROM users WHERE " +
  "last_update < NOW() - INTERVAL '30 days'"
).then(success)
