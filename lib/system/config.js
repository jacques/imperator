'use strict';

var fs = require('fs');

var Promise = require('bluebird');
var debug = require('debuglog')('imperator/config');


exports.load = function load (options) {
  debug('init config');

  var deferred = Promise.pending();

  fs.exists(options.config_file, function (exists) {
    if (!exists) {
      deferred.reject({
        "message": "config file doesn't exist"
      });

      return;
    }

    debug('loading config file %s', options.config_file);

    fs.readFile(options.config_file, function (err, data) {
      if (err) {
        deferred.reject(err);
        return;
      }

      try {
        var config = JSON.parse(data);

        deferred.resolve(config);
      } catch (err) {
        deferred.reject(err);
      }
    });
  });

  return deferred.promise;
};
