'use strict';

const { DATABASE_URL } = require('./config');
const knex = require('knex')(DATABASE_URL);
const express = require('express');
const router = express.Router();

router.get('/:userID', (req, res, err) => {
  //select * from tags where userid === userid(inputted by client)
});

module.exports = router;