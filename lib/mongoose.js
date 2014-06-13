'use strict';

var Promise = require('bluebird');
var mongoose = require('mongoose');

var debug = require('debuglog')('imperator/mongoose');


module.exports = function initMongoose (app) {
  debug('init mongoose');

  var deferred = Promise.pending();

  try {
    var config = app.get('config');

    mongoose.connect(config.mongoose.url);

    var db = mongoose.connection;
    db.on('error', debug.bind(debug, 'connection error:'));
    db.once('open', function callback() {
      debug('connection open');
    });

    deferred.resolve(app);
  } catch (err) {
    deferred.reject(err);
  }

  return deferred.promise;
};
