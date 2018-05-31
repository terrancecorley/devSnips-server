'use strict';

const { DATABASE_URL } = require('../config');
const knex = require('knex')(DATABASE_URL);
const passport = require('passport');
const express = require('express');
const router = express.Router();

// Protect endpoints using JWT Strategy
router.use('/', passport.authenticate('jwt', { session: false, failWithError: true }));

router.get('/', (req, res, next) => {
  const userID = req.user.id;

  knex.select('snips.id', 'title', 'content', 'snips_tags.snipid as snipID', 'tags.id as tagID', 'tags.name as tagName')
    .from('snips')
    .where('snips.userid', userID)
    .leftJoin('snips_tags','snips.id', 'snips_tags.snipid' )
    .leftJoin('tags', 'tags.id', 'snips_tags.tagid')
    .orderBy('snips.id')
    .then(results => {
      const result = results[0];
      res.json(result);
    })
    .catch(err => next(err));
});

router.post('/', (req, res, next) => {
  const { title, content, tags = [] } = req.body;
  const userId = req.user.id;

  /***** Never trust users - validate input *****/
  if (!title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }

  // if (tags) {
  //   tags.forEach((tag) => {
  //     if (Tag.find({_id: tag}).userId !== userId) {
  //       const err = new Error('The item is not valid');
  //       err.status = 401;
  //       return next(err);
  //     }
  //   });
  // }

  knex
    .insert({ title, content, tags, userid })
    .into('snips')
    .then(results => {
      let result = results[0];
      res
        .location(`${req.originalUrl}/${result.id}`)
        .status(201)
        .json(result);
    })
    .catch(err => {
      next(err);
    });
});

router.put('/', (req, res, next) => {
  //update a snip
});

router.delete('/', (req, res, next) => {
  // delete a snip
});

module.exports = router;