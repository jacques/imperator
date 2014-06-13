'use strict';

var path = require('path');

var Promise = require('bluebird');
var debug = require('debuglog')('imperator/models');


module.exports = function initRoutes (app) {
  debug('init models');

  var deferred = Promise.pending();

  try {
    var config = app.get('config');

    if (config.models) {
      config.models.forEach(function loadModel (name) {
        debug('loading model:', name);

        require(path.join('../models', name));
      });
    }

    deferred.resolve(app);
  } catch (err) {
    deferred.reject(err);
  }

  return deferred.promise;
};
