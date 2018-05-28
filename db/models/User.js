const mongoose = require('mongoose');
require('dotenv').config();

const { MONGO_USER, MONGO_PASS, MONGO_SERVER, MONGO_DB } = process.env;

const uri =
  `mongodb+srv://${MONGO_USER}:${MONGO_PASS}@${MONGO_SERVER}.mongodb.net/${MONGO_DB}`;

mongoose.connect(uri,
  null, (err, db) => {
  console.log('db err?', err);
});

const UserSchema = new mongoose.Schema(
  {
    ip_address: String,
    ipstack: String,
    last_update: Date
  },
  { collection: 'user-data' }
);

module.exports = mongoose.model('User', UserSchema);
