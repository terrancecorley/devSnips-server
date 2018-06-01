'use strict';

const { DATABASE_URL } = require('../config');
const knex = require('knex')(DATABASE_URL);
const passport = require('passport');
const express = require('express');
const router = express.Router();

// Protect endpoints using JWT Strategy
router.use('/', passport.authenticate('jwt', { session: false, failWithError: true }));

router.get('/', (req, res, next) => {
  const user_id = req.user.id;

  knex.select('snips.id', 'title', 'content', 'snip_id', 'tags.id as tagID', 'tags.name as tagName')
    .from('snips')
    .where('snips.user_id', user_id)
    .leftJoin('snips_tags','snips.id', 'snip_id' )
    .leftJoin('tags', 'tags.id', 'tag_id')
    .orderBy('snips.id')
    .then(results => {
      res.json([...results]);
    })
    .catch(err => next(err));
});

router.get('/:snipID', (req, res, next) => {
  const user_id = req.user.id;
  const snipID = req.params.snipID;

  knex.select('snips.id', 'title', 'content', 'snip_id', 'tags.id as tagID', 'tags.name as tagName')
    .from('snips')
    .where({
      'snips.user_id': user_id,
      'snips.id': snipID
    })
    .leftJoin('snips_tags','snips.id', 'snip_id' )
    .leftJoin('tags', 'tags.id', 'tag_id')
    .orderBy('snips.id')
    .then(results => {
      let result = results[0];
      res.json(result);
    })
    .catch(err => next(err));
});

router.post('/', (req, res, next) => {
const { title, content, tags = [] } = req.body;
  const user_id = req.user.id;

  const newSnip = { 
    title,
    content,
    user_id
  };

  /***** Never trust users - validate input *****/
  if (!newSnip.title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }

  let snip_id;

  knex
    .insert(newSnip)
    .into('snips')
    .returning(['id', 'title', 'content'])
    .then( ([item]) => {
      snip_id = item.id;

      knex 
        .select()
        .from('tags')
        .where((builder) => {
          builder.whereIn('name', tags)
        })
        .andWhere(function() {
          this.whereIn('user_id', user_id)
        })
        .then((tags) => {
          console.log(tags);
          const tagsInsert = tags.map(tag => ({ snip_id, tag_id: tag.id }));
          console.log('THIS RANNNNNN', tagsInsert);
          return knex.insert(tagsInsert).into('snips_tags');
        })
    })
    .then( () => {
      return knex.select('snips.id', 'title', 'content',
    'tags.id as tagId', 'tags.name as tagName')
        .from('snips')
        .where('snips.id', snip_id)
        .leftJoin('snips_tags','snip_id', 'snips.id') //possibly .and
        .leftJoin('snips_tags', 'tags.id', 'tag_id')
    })
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
  const user_id = req.user.id;
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
    user_id
  };

  knex
    .update(updateItem)
    .from('snips')
    .where(id)
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
        .where(id);
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
  const user_id = req.user.id;

  knex
    .from('snips')
    .where({
      id,
      user_id
    })
    .del()
    .then( () => {
      res.sendStatus(204).end();
    })
    .catch( (err) => {
      next(err);
    });
});

module.exports = router;