/*

DB UPDATE METHOD
  updates user row with ipstack data by id

*/

export default (db, success, failure) => (id, body) => db.one(
    'UPDATE users set ipstack = $(stack), last_update = CURRENT_DATE ' +
    'where id = $(id)' +
    'RETURNING *',
    {
      id: `${id}`,
      stack: `${JSON.stringify(body)}`
    }
  )
    .then(success)
    .catch(failure);
