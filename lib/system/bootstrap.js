'use strict';

var Promise = require('bluebird');
var endgame = require('endgame');
var express = require('express');
var debug = require('debuglog')('imperator/bootstrap');


module.exports = function bootstrap (options) {
  endgame();

  options = options || {};

  var app = express();

  app.once('mount', function onmount (parent) {
    var deferred, complete, start, error;

    parent._router.stack.pop();

    deferred = Promise.pending();
    complete = deferred.resolve.bind(deferred);
    start = parent.emit.bind(parent, 'start');
    error = parent.emit.bind(parent, 'error');

    var settings = require('./settings');
    var mongoose = require('./mongoose');
    var models = require('./models');
    var routes = require('./routes');
    var inject = require('./inject_data');
    var passport = require('./passport');
    var tasks = require('./tasks');

    settings(parent, options)
      .then(mongoose)
      .then(models)
      .then(passport)
      .then(inject)
      .then(routes)
      .then(tasks)
      .then(complete)
      .then(start)
      .catch(error)
      .done(function complete() {
        debug('bootstrap complete');
      });

    parent.use(function startup (req, res, next) {
      if (deferred.promise.isFulfilled()) {
        next();
        return;
      }

      res.send(503, 'Server is starting.');
    });
  });

  return app;
};
