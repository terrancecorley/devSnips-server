'use strict';

const { DATABASE_URL } = require('./config');
const knex = require('knex')(DATABASE_URL);
const express = require('express');
const router = express.Router();



module.exports = router;