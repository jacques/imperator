'use strict';

var Promise = require('bluebird');
var mongoose = require('mongoose');


module.exports = function (router) {
  var User = mongoose.models.User;

  router.get('/', function (req, res) {
    Promise.props({
      users: User.find().sort({ username: 1 }).exec()
    }).then(function (models) {
      res.render('user/list', models);
    });
  });

  router.get('/new', function (req, res) {
    res.render('user/new', {
      user: new User({
        username: ''
      })
    });
  });

  router.get('/:user_id', function (req, res) {
    Promise.props({
      user: User.findOne({ _id: req.param('user_id') }).exec()
    }).then(function (models) {
      res.render('user/show', models);
    });
  });

  router.get('/:user_id/edit', function (req, res) {
    Promise.props({
      user: User.findOne({ _id: req.param('user_id') }).exec()
    }).then(function (models) {
      res.render('user/edit', models);
    });
  });

  router.post('/', function (req, res) {
    var user = new User({
      username: req.param('username'),
      password: req.param('password')
    });

    if (user.password.length > 0 &&
        req.param('password') !== req.param('password_confirmation')) {
      req.flash('error', 'password and confirmation must match');

      res.redirect('/user/new');
      return;
    }

    user.save(function (err) {
      if (err) {
        res.render('error', {
          message: 'save failed',
          error: err,
          url: req.url
        });

        return;
      }

      req.flash('success', 'User "%s" has been created', user.username);

      res.redirect('/user');
    });
  });

  router.post('/:user_id', function (req, res) {
    Promise.props({
      user: User.findOne({ _id: req.param('user_id') }).exec()
    }).then(function (models) {
      models.user.username = req.param('username');

      if (req.param('password')) {
        if (req.param('password') !== req.param('password_confirmation')) {
          req.flash('error', 'password and confirmation must match');

          res.redirect('/user/' + req.param('user_id') + '/edit');
          return;
        }

        models.user.password = req.param('password');
      }

      models.user.save(function (err) {
        if (err) {
          req.flash('error', 'User "%s" could not be saved', models.user.username);
        } else {
          req.flash('success', 'User "%s" has been saved', models.user.username);
        }

        res.redirect('/user/' + models.user.id);
      });
    });
  });

  router.delete('/:user_id', function (req, res) {
    Promise.props({
      user: User.findOne({ _id: req.param('user_id') }).exec()
    }).then(function (models) {
      models.user.remove();

      req.flash('success', 'User "%s" has been deleted', models.user.username);

      res.redirect('/user');
    });
  });
};
