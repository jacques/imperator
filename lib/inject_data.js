'use strict';

var _ = require('underscore');
var Promise = require('bluebird');
var debug = require('debuglog')('imperator/inject');


module.exports = function injectData (app) {
  debug('inject data into routes');

  var deferred = Promise.pending();

  try {
    var config = app.get('config');

    app.use(function inject (req, res, next) {
      // inject user
      if (req.isAuthenticated()) {
        res.locals.user = req.user;
      }

      // inject req
      res.locals.req = req;

      // inject flash messages
      var flashMessages = {
        info: req.flash('info'),
        success: req.flash('success'),
        warning: req.flash('warning'),
        error: req.flash('error')
      };

      res.locals.messages = _.any(flashMessages, function(msgs) { return msgs.length; }) ? flashMessages : false;

      next();
    });

    deferred.resolve(app);
  } catch (err) {
    deferred.reject(err);
  }

  return deferred.promise;
};
