'use strict';

var passport = require('passport');


module.exports = function (router) {
  router.get('/login', function (req, res) {
    res.render('auth/login');
  });

  router.post('/login', function (req, res) {
    passport.authenticate('local', {
      successRedirect: req.session.goingTo || '/',
      failureRedirect: '/login',
      failureFlash: true
    })(req, res);
  });

  router.get('/logout', function (req, res) {
    req.logout();

    res.redirect('/');
  });
};
