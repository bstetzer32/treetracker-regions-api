const express = require('express');
const Sentry = require('@sentry/node');
const bodyParser = require('body-parser');
const asyncHandler = require('express-async-handler');
const { check, validationResult } = require('express-validator');
const { body } = require('express-validator');
const log = require('loglevel');
const HttpError = require('./utils/HttpError');
const regionRouter = require('./routes/regionRoutes');
const collectionRounter = require('./routes/collectionRoutes'); // create your router
const { errorHandler } = require('./handlers/utils');
const helper = require('./handlers/utils');
const config = require('../config/config');

const app = express();

Sentry.init({ dsn: config.sentry_dsn });

/*
 * Check request
 */
app.use(
  helper.handlerWrapper(async (req, _res, next) => {
    if (
      req.method === 'POST' ||
      req.method === 'PATCH' ||
      req.method === 'PUT'
    ) {
      if (req.headers['content-type'] !== 'application/json') {
        throw new HttpError(
          415,
          'Invalid content type. API only supports application/json',
        );
      }
    }
    next();
  }),
);

app.use(bodyParser.urlencoded({ extended: false })); // parse application/x-www-form-urlencoded
app.use(bodyParser.json()); // parse application/json

// routers
app.use('/region', regionRouter);
app.use('collection', collectionRounter);

// paths
// app.get('/entity', asyncHandler(async (req, res, next) => {
//
// }));

// Global error handler
app.use(errorHandler);

const { version } = require('../package.json');

app.get('*', function (req, res) {
  res.status(200).send(version);
});

module.exports = app;
