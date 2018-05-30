'use strict';

const { DATABASE_URL } = require('../config');
const knex = require('knex')(DATABASE_URL);
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');

router.post('/', (req, res, next) => {

  // Validation
  const requiredFields = ['username', 'password', 'email'];
  const missingField = requiredFields.find(field => !(field in req.body));

  if (missingField) {
    const err = new Error(`Missing '${missingField}' in request body`);
    err.status = 422;
    err.reason = 'ValidationError';
    err.location = missingField;
    return next(err);
  }

  const stringFields = ['username', 'password', 'email'];
  const notString = stringFields.find(field => field in req.body && typeof req.body[field] !== 'string');

  if (notString) {
    const err = new Error(`'${notString}' is not a string value`);
    err.status = 422;
    err.message = 'Incorrect field type: expected string';
    err.reason = 'ValidationError';
    err.location = notString;
    return next(err);
  }

  const explicityTrimmedFields = ['username', 'password', 'email'];
  const nonTrimmedField = explicityTrimmedFields.find(
    field => req.body[field].trim() !== req.body[field]
  );

  if (nonTrimmedField) {
    const err = new Error(`Field: '${nonTrimmedField}' cannot start or end with whitespace`);
    err.status = 422;
    err.message = 'Cannot start or end with whitespace';
    err.reason = 'ValidationError';
    err.location = nonTrimmedField;
    return next(err);
  }

  const sizedFields = {
    username: { min: 1 },
    password: { min: 8, max: 72 },
    email: { min: 8, max: 72 }
  };

  const tooSmallField = Object.keys(sizedFields).find(
    field => 'min' in sizedFields[field] &&
      req.body[field].trim().length < sizedFields[field].min
  );

  if (tooSmallField) {
    const min = sizedFields[tooSmallField].min;
    const err = new Error(`Field: '${tooSmallField}' must be at least ${min} characters long`);
    err.status = 422;
    err.message = `${tooSmallField} must be at least ${min} character(s)`;
    err.reason = 'ValidationError';
    err.location = tooSmallField;
    return next(err);
  }

  const tooLargeField = Object.keys(sizedFields).find(
    field => 'max' in sizedFields[field] &&
      req.body[field].trim().length > sizedFields[field].max
  );

  if (tooLargeField) {
    const max = sizedFields[tooLargeField].max;
    const err = new Error(`Field: '${tooSmallField}' must be at most ${max} characters long`);
    err.status = 422;
    err.message = 'password cannot be greater than 72 characters';
    err.reason = 'ValidationError';
    err.location = tooLargeField;
    return next(err);
  }

  // response
  let { username, password, email } = req.body;

  const hashPassword = (password) => {
    return bcrypt.hash(password, 10);
  };

  return hashPassword(password)
    .then(digest => {
      const newUser = {
        username,
        password: digest,
        email
      };
    return knex
      .insert(newUser)
      .into('users')
      .returning(['id', 'username']); 
    })
    .then(result => {
      return res.location(`${req.originalUrl}/${result[0].id}`).status(201).json(result);
    })
    .catch(err => {
      if (err.code === '23505') {
        err = new Error('The username already exists');
        err.status = 400;
      }
      if (err.code === '23502' && err.column === 'email') {
        err = new Error('Please enter an email address');
        err.status = 400;
      }
      next(err);
    });

});



module.exports = router;