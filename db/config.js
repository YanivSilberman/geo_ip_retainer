const promiseLib = require('bluebird');
const pgp = require('pg-promise')({ promiseLib });
require('dotenv').config();

/*

connect to aws
psql --host=geo.caub3fkwqsl4.us-east-1.rds.amazonaws.com --port=5432 --username=yanivsilberman --password --dbname=geo
pass: geoipretainer

*/

const {
  env: { AWS_HOST, AWS_PORT, AWS_DB, AWS_USER, AWS_PASSWORD }
} = process;

const connectionParams = {
  host: AWS_HOST,
  port: AWS_PORT,
  database: AWS_DB,
  user: AWS_USER,
  password: AWS_PASSWORD
};

export default pgp(connectionParams);
