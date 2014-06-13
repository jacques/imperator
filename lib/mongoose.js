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
    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', function callback() {
      console.log('db connection open');
    });

    deferred.resolve(app);
  } catch (err) {
    deferred.reject(err);
  }

  return deferred.promise;
};
