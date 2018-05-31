'use strict';

const { DATABASE_URL } = require('../config');
const knex = require('knex')(DATABASE_URL);
const passport = require('passport');
const express = require('express');
const router = express.Router();

// Protect endpoints using JWT Strategy
router.use('/', passport.authenticate('jwt', { session: false, failWithError: true }));

router.get('/:userID', (req, res, next) => {
  // get all snips from appropriate userID... and tags? (ask zach, this can probably be done separately without a problem)
  
});

router.post('/:userID', (req, res, next) => {
  // post snip for appropriate userID
});

router.put('/:userID', (req, res, next) => {
  //update a snip
});

router.delete('/:userID', (req, res, next) => {
  // delete a snip
});

module.exports = router;