'use strict';

const { Strategy: LocalStrategy } = require('passport-local');
const knex = require('knex');

// ===== Define and create basicStrategy =====
const localStrategy = new LocalStrategy((username, password, done) => {
  let user;

  const validatePassword = (password) => {
    return bcrypt.compare(password, this.password); //user.password possibly 
  };

  return knex
    .select()
    .from('users')
    .where('username', username)
    .then(results => {
      user = results[0];
      if (!user) {
        return Promise.reject({
          reason: 'LoginError',
          message: 'Incorrect username',
          location: 'username',
          status: 401
        });
      }
      return validatePassword(user.password);
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