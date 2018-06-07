'use strict';

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const authRouter = require('./routes/auth-router')
const usersRouter = require('./routes/users-router');
const snipsRouter = require('./routes/snips-router');
const tagsRouter = require('./routes/tags-router');


const { PORT, CLIENT_ORIGIN } = require('./config');
const {dbConnect} = require('./db/db-knex');

const app = express();

const passport = require('passport');
const localStrategy = require('./passport/local');
const jwtStrategy = require('./passport/jwt');

app.use(
  morgan(process.env.NODE_ENV === 'production' ? 'common' : 'dev', {
    skip: (req, res) => process.env.NODE_ENV === 'test'
  })
);

app.use(
  cors({
    origin: CLIENT_ORIGIN
  })
);

// Parse request body
app.use(express.json());

// Utilize the strategy
passport.use(localStrategy);

// Utilize the jwt strategy
passport.use(jwtStrategy);

// Mounted routes
app.use('/api', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/snips', snipsRouter);
app.use('/api/tags', tagsRouter);

// Catch-all 404
app.use(function (req, res, next) {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// Catch-all Error handler
// Add NODE_ENV check to prevent stacktrace leak
app.use(function (err, req, res, next) {
  res.sendStatus(err.status || 500);
  if(!err.status) {
    console.error(err);
  }
});

function runServer(port = PORT) {
  const server = app
    .listen(port, () => {
      console.info(`App listening on port ${server.address().port}`);
    })
    .on('error', err => {
      console.error('Express failed to start');
      console.error(err);
    });
}

if (require.main === module) {
  dbConnect();
  runServer();
}

module.exports = { app };
