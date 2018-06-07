'use strict';

const createKnex = require('knex');

const {DATABASE_URL} = require('../config');

let knex = null;

function dbConnect(url = DATABASE_URL) {
  knex = createKnex({
    client: 'pg',
    connection: url,
    debug: false, // http://knexjs.org/#Installation-debug
    pool: {min : 1 , max : 2}
  });
}

function dbDisconnect() {
  return knex.destroy();
}

function dbGet() {
  return knex;
}

module.exports = {
  dbConnect,
  dbDisconnect,
  dbGet
};
