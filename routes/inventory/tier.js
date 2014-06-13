'use strict';

var Promise = require('bluebird');
var mongoose = require('mongoose');


module.exports = function (router) {
  var Tier = mongoose.models.Tier;
  var Machine = mongoose.models.Machine;

  router.get('/', function (req, res) {
    Promise.props({
      tiers: Tier.find().sort({ name: 1 }).exec()
    }).then(function (models) {
      res.render('tier/list', models);
    });
  });

  router.get('/new', function (req, res) {
    res.render('tier/new');
  });

  router.get('/:tier_id', function (req, res) {
    Promise.props({
      tier: Tier.findOne({ _id: req.param('tier_id') }).populate('environment platform').exec(),
      machines: Machine.find({ tier: req.param('tier_id') }).exec()
    }).then(function (models) {
      res.render('tier/show', models);
    });
  });

  router.post('/', function (req, res) {
    var tier = new Tier({
      environment: req.param('environment'),
      platform: req.param('platform'),
      name: req.param('name'),
      base_image: req.param('base_image'),
      home_network: req.param('home_network')
    });

    tier.save(function (err) {
      if (err) {
        res.render('error', {
          message: 'save failed',
          error: err,
          url: req.url
        });

        return;
      }

      req.flash('success', 'Tier "%s" has been created', tier.name);

      res.redirect('/tier/' + tier.id);
    });
  });

  router.delete('/:tier_id', function (req, res) {
    Promise.props({
      tier: Tier.findOne({ _id: req.param('tier_id') }).exec()
    }).then(function (models) {
      models.tier.remove();

      req.flash('success', 'Tier "%s" has been deleted', models.tier.name);

      res.redirect('/tier');
    });
  });
};
