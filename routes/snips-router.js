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
const { title, content, /* tags = [] */ } = req.body;
  const userID = req.user.id;

  const newSnip = { 
    title,
    content,
    "userid": userID
    /* tags */
  };

  /***** Never trust users - validate input *****/
  if (!newSnip.title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }

  let snipID;

  knex
    .insert(newSnip)
    .into('snips')
    .returning(['id', 'title', 'content'])
    // .then( ([id]) => {
    //   snipID = id;
    //   const tagsInsert = tags.map(tagId => ({ note_id: snipID, tag_id: tagId }));
    //   return knex.insert(tagsInsert).into('snips_tags');
    // })
    // .then( () => {
    //   return knex.select('snips.id', 'title', 'content'
    /*'tags.id as tagId', 'tags.name as tagName')*/
        // .from('snips')
        // .leftJoin('snips_tags','snips_tags.snipid', 'snips.id')
        // .leftJoin('tags', 'tags.id', 'snips_tags.tagid')
    // })
    .then( (results) => {
      if (results) {
        const result = results[0];
        res.location(`${req.originalUrl}/${result.id}`).status(201).json(result);
      } else {
        next();
      }
    })
    .catch( (err) => {
      next(err);
    });
});

router.put('/:snipID', (req, res, next) => {
  const id = req.params.snipID;
  const userID = req.user.id;
  const { title, content, /*tags = []*/ } = req.body;

  /***** Never trust users - validate input *****/
  if (!title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }

  const updateItem = {
    title,
    content,
    "userid": userID
  };

  knex
    .update(updateItem)
    .from('snips')
    .where('id', id)
    // .then( () => {
    //   return knex.del().from('snips_tags').where('note_id', id);
    // })
    // .then( () => {
    //   const tagsInsert = tags.map(tagId => ({ note_id: id, tag_id: tagId }));
    //   return knex.insert(tagsInsert).into('snips_tags');
    // })
    .then( () => {
    return knex.select('snips.id', 'title', 'content' /*'tags.id as tagId', 'tags.name as tagName'*/)
        .from('snips')
        // .leftJoin('snips_tags','snips_tags.snipid', 'snips.id')
        // .leftJoin('tags', 'tags.id', 'snips_tags.tag_id')
        .where('snips.id', id);
    })
    .then( (results) => {
      if (results) {
        const result = results[0];
        res.json(result);
      } else {
        next();
      }
    })
    .catch( (err) => {
      next(err);
    });
});

router.delete('/:id', (req, res, next) => {
  const id = req.params.id;
  const userID = req.user.id;

  knex
    .from('snips')
    .where({id, "userid": userID})
    .del()
    .then( () => {
      res.sendStatus(204).end();
    })
    .catch( (err) => {
      next(err);
    });
});

module.exports = router;