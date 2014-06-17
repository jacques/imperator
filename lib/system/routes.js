'use strict';

var path = require('path');

var Promise = require('bluebird');
var express = require('express');
var debug = require('debuglog')('imperator/routes');


module.exports = function initRoutes (app) {
  debug('init routes');

  var deferred = Promise.pending();

  try {
    var config = app.get('config');
    var loadController = function loadController (name) {
      debug('loading controller:', name);

      require(path.join('../../routes', name))(router);
    };

    for (var route_name in config.routes) {
      var route = config.routes[route_name];

      if (route.controllers && route.controllers.length > 0) {
        var router = express.Router();

        route.controllers.forEach(loadController);

        app.use(route.mount || '/', router);
      }
    }

    deferred.resolve(app);
  } catch (err) {
    deferred.reject(err);
  }

  return deferred.promise;
};
