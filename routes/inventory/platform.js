'use strict';

var Promise = require('bluebird');
var mongoose = require('mongoose');


module.exports = function (router) {
  var Platform = mongoose.models.Platform;
  var Tier = mongoose.models.Tier;

  router.get('/', function (req, res) {
    res.redirect('/');
  });

  router.get('/new', function (req, res) {
    res.render('platform/new');
  });

  router.get('/:platform_id', function (req, res) {
    Promise.props({
      platform: Platform.findOne({ _id: req.param('platform_id') }).populate('environment').exec(),
      tiers: Tier.find({ platform: req.param('platform_id') }).exec()
    }).then(function (models) {
      res.render('platform/show', models);
    });
  });

  router.get('/:platform_id/edit', function (req, res) {
    Promise.props({
      platform: Platform.findOne({ _id: req.param('platform_id') }).exec(),
      tiers: Tier.find({ platform: req.param('platform_id') }).exec()
    }).then(function (models) {
      res.render('platform/edit', models);
    });
  });

  router.post('/', function (req, res) {
    var platform = new Platform({
      environment: req.param('environment'),
      name: req.param('name')
    });

    platform.save(function (err) {
      if (err) {
        res.render('error', {
          message: 'save failed',
          error: err,
          url: req.url
        });

        return;
      }

      req.flash('success', 'Platform "%s" has been created', platform.name);

      res.redirect('/platform/' + platform.id);
    });
  });

  router.post('/:platform_id', function (req, res) {
    Promise.props({
      platform: Platform.findOne({ _id: req.param('platform_id') }).exec()
    }).then(function (models) {
      models.platform.environment = req.param('environment');
      models.platform.name = req.param('name');

      models.platform.save(function (err) {
        if (err) {
          req.flash('error', 'Platform "%s" could not be saved', models.platform.name);
        } else {
          req.flash('success', 'Platform "%s" has been saved', models.platform.name);
        }

        res.redirect('/platform/' + models.platform.id);
      });
    });
  });

  router.delete('/:platform_id', function (req, res) {
    Promise.props({
      platform: Platform.findOne({ _id: req.param('platform_id') }).exec()
    }).then(function (models) {
      models.platform.remove();

      req.flash('success', 'Platform "%s" has been deleted', models.platform.name);

      res.redirect('/platform');
    });
  });
};
