'use strict';

const { DATABASE_URL } = require('../config');
const knex = require('knex')(DATABASE_URL);
const passport = require('passport');
const express = require('express');
const router = express.Router();

// Protect endpoints using JWT Strategy
router.use('/', passport.authenticate('jwt', { session: false, failWithError: true }));

// get all tags by a specified user
router.get('/', (req, res, next) => {
  let userID = req.user.id;

  knex.select('userid', 'name')
  .from('tags')
  .where('userid', userID)
  .then(results => {
    res.json(results);
  })
  .catch(err => next(err));
});

router.post('/', (req, res, next) => {
  let userID = req.user.id;
  let name = req.body.tagName;

  let newTag = {
    name,
    userid: userID
  }

  knex
    .insert(newTag)
    .into('tags')
    .returning(['id', 'name'])
    .then((results) => {
      const result = results[0];
      res.location(`${req.originalUrl}/${result.id}`).status(201).json(result);
    })
});

router.put('', (req, res, next) => {
  //update a tag name
})

router.delete('', (req, res, next) => {
  //delete a tag
});

module.exports = router;