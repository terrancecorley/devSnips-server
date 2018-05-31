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

// post new tag to db
router.post('/', (req, res, next) => {
  let userID = req.user.id;
  let name = req.body.tagName;

   if (!name) {
    const err = new Error('Missing `tagName` in request body');
    err.status = 400;
    return next(err);
  }

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
    .catch(err => {
      if (err.code === 23505) {
        err = new Error('Tag name already exists');
        err.status = 400;
      }
      next(err);
    });
});

// update tag name on db
router.put('/:tagID', (req, res, next) => {
  let id = req.params.tagID;
  let userID = req.user.id;
  let name = req.body.tagName;

  if (!name) {
    const err = new Error('Missing `tagName` in request body');
    err.status = 400;
    return next(err);
  }

  let updateTag = {
    name
  }

  knex
    .update(updateTag)
    .from('tags')
    .where({
      id,
      "userid": userID 
    })
    .returning(['id', 'name'])
    .then( ([results]) => {
      console.log(results);
      res.json(results);
    })
    .catch(err => {
      if (err.code === 23505) {
        err = new Error('Tag name already exists');
        err.status = 400;
      }
      next(err);
    });
});

// delete tag from db
router.delete('/:tagID', (req, res, next) => {
  const id = req.params.tagID;
  const userID = req.user.id;

  knex
    .from('tags')
    .where({
      id,
      "userid": userID
    })
    .del()
    .then( () => {
      res.sendStatus(204);
    })
    .catch( (err) => {
      next(err);
    });
});

module.exports = router;