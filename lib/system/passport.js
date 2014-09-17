'use strict';

var path = require('path');

var Promise = require('bluebird');
var passport = require('passport');
var mongoose = require('mongoose');
var debug = require('debuglog')('imperator/passport');

var LocalStrategy = require('passport-local').Strategy;


module.exports = function initPassport (app) {
  debug('init passport');

  app.use(passport.initialize());
  app.use(passport.session());

  app.use(function (req, res, next) {
    if (req.isAuthenticated() || req.url.match(/^\/login/)) {
      return next();
    }

    res.redirect('/login');
  });

  var User = mongoose.models.User;
  var deferred = Promise.pending();

  try {
    var config = app.get('config');

    passport.use(new LocalStrategy(function (username, password, done) {
      User.findOne({
        "username": username
      }, function (err, user) {
        if (err) {
          return done(err);
        }

        if (!user) {
          return done(null, false, {
            message: 'Username/Password incorrect'
          });
        }

        if (!user.passwordMatches(password)) {
          return done(null, false, {
            message: 'Username/Password incorrect'
          });
        }

        done(null, user);
      });
    }));

    passport.serializeUser(function serialize (user, done) {
      done(null, user.id);
    });

    passport.deserializeUser(function serialize (id, done) {
      User.findOne({
        "_id": id
      }, function (err, user) {
        done(null, user);
      });
    });

    if (config.env === 'development') {
      User.count({}).exec(function (err, count) {
        if (count <= 0) {
          User.create({ username: 'root', password: 'root', roles: [ 'admin' ] }, function (err, admin) {
            console.log('created an admin user for you: root/root');
          });
        }
      });
    }

    deferred.resolve(app);
  } catch (err) {
    deferred.reject(err);
  }

  return deferred.promise;
};
