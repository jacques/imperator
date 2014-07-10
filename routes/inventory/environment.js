'use strict';

var Promise = require('bluebird');
var mongoose = require('mongoose');


module.exports = function (router) {
  var Environment = mongoose.models.Environment;
  var Platform = mongoose.models.Platform;
  var Stingray = mongoose.models.Stingray;

  router.get('/', function (req, res) {
    Promise.props({
      environments: Environment.find().sort({ name: 1 }).exec()
    }).then(function (models) {
      res.render('environment/list', models);
    });
  });

  router.get('/new', function (req, res) {
    res.render('environment/new');
  });

  router.get('/:environment_id', function (req, res) {
    Promise.props({
      environment: Environment.findOne({ _id: req.param('environment_id') }).exec(),
      platforms: Platform.find({ environment: req.param('environment_id') }).exec(),
      stingrays: Stingray.find({ environment: req.param('environment_id') }).exec()
    }).then(function (models) {
      res.render('environment/show', models);
    });
  });

  router.get('/:environment_id/edit', function (req, res) {
    Promise.props({
      environment: Environment.findOne({ _id: req.param('environment_id') }).exec(),
      platforms: Platform.find({ environment: req.param('environment_id') }).exec(),
      stingrays: Stingray.find({ environment: req.param('environment_id') }).exec()
    }).then(function (models) {
      res.render('environment/edit', models);
    });
  });

  router.post('/', function (req, res) {
    var environment = new Environment({
      name: req.param('name'),
      pkgcloud_options: req.param('pkgcloud_options')
    });

    environment.save(function (err) {
      if (err) {
        res.render('error', {
          message: 'save failed',
          error: err,
          url: req.url
        });

        return;
      }

      req.flash('success', 'Environment "%s" has been created', environment.name);

      res.redirect('/environment/' + environment.id);
    });
  });

  router.post('/:environment_id', function (req, res) {
    Promise.props({
      environment: Environment.findOne({ _id: req.param('environment_id') }).exec()
    }).then(function (models) {
      models.environment.name = req.param('name');
      models.environment.pkgcloud_options = req.param('pkgcloud_options');

      models.environment.save(function (err) {
        if (err) {
          req.flash('error', 'Environment "%s" could not be saved', models.environment.name);
        } else {
          req.flash('success', 'Environment "%s" has been saved', models.environment.name);
        }

        res.redirect('/environment/' + models.environment.id);
      });
    });
  });

  router.delete('/:environment_id', function (req, res) {
    Promise.props({
      environment: Environment.findOne({ _id: req.param('environment_id') }).exec()
    }).then(function (models) {
      models.environment.remove();

      req.flash('success', 'Environment "%s" has been deleted', models.environment.name);

      res.redirect('/environment');
    });
  });
};
