'use strict';

const { DATABASE_URL } = require('../config');
const knex = require('knex')(DATABASE_URL);
const passport = require('passport');
const express = require('express');
const router = express.Router();

// Protect endpoints using JWT Strategy
router.use('/', passport.authenticate('jwt', { session: false, failWithError: true }));

router.get('/:userID', (req, res, next) => {
  //select * from tags where userid === userid(inputted by client/id on users table)

  return knex
});

router.post('/:userID', (req, res, next) => {
  //post newly created tag 
});

router.put('/:userID', (req, res, next) => {
  //update a tag name
})

router.delete('/:userID', (req, res, next) => {
  //delete a tag
});

module.exports = router;