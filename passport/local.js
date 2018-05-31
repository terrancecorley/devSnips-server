'use strict';

const { Strategy: LocalStrategy } = require('passport-local');
const { DATABASE_URL } = require('../config');
const knex = require('knex')(DATABASE_URL);
const bcrypt = require('bcryptjs');

// ===== Define and create basicStrategy =====
const localStrategy = new LocalStrategy((username, password, done) => {
  let user;

  const validatePassword = (dbPassword, userPassword) => {
    return bcrypt.compare(dbPassword, userPassword); //user.password possibly 
  };

  return knex
    .select()
    .from('users')
    .where('username', username)
    .then(results => {
      let dbUser = results[0];
      if (!dbUser) {
        return Promise.reject({
          reason: 'LoginError',
          message: 'Incorrect username',
          location: 'username',
          status: 401
        });
      }
      return validatePassword(dbUser.password, password);
    })
    .then(isValid => {
      if (!isValid) {
        return Promise.reject({
          reason: 'LoginError',
          message: 'Incorrect password',
          location: 'password',
          status: 401
        });
      }
      return done(null, user);
    })
    .catch(err => {
      if (err.reason === 'LoginError') {
        return done(null, false);
      }
      return done(err);
    });
});


module.exports = localStrategy;