'use strict';

var path = require('path');

var Promise = require('bluebird');
var debug = require('debuglog')('imperator/tasks');


module.exports = function initRoutes (app) {
  debug('init tasks');

  var deferred = Promise.pending();

  try {
    var config = app.get('config');

    config.tasks.forEach(function eachTask(task) {
      debug('loading task %s', task.name);

      var t = require(path.join('../../tasks', task.name))();

      if (task.enabled) {
        debug('enabling task %s', task.name);

        t.run(task.interval);
      }
    });

    deferred.resolve(app);
  } catch (err) {
    deferred.reject(err);
  }

  return deferred.promise;
};
