'use strict';

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

app.use('/api', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/snips', snipsRouter);
app.use('/api/tags', tagsRouter);

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
