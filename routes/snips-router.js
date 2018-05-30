'use strict';

const { DATABASE_URL } = require('./config');
const knex = require('knex')(DATABASE_URL);
const express = require('express');
const router = express.Router();

router.get('/', (req, res, err) => {
  const arr = [];
  return res.json(arr);
});

router.post('/', (req, res, err) => {
  let obj = {
    type: 'submitted',
    message: 'I was submitted'
  };

  return res.json(obj);

});

module.exports = router;