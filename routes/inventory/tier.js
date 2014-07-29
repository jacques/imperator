'use strict';

var _ = require('underscore');
var Promise = require('bluebird');
var mongoose = require('mongoose');


module.exports = function (router) {
  var Environment = mongoose.models.Environment;
  var Tier = mongoose.models.Tier;
  var Machine = mongoose.models.Machine;
  var Network = mongoose.models.Network;
  var CfPersonas = mongoose.models.CfPersonas;

  router.get('/', function (req, res) {
    Promise.props({
      tiers: Tier.find().sort({ name: 1 }).exec()
    }).then(function (models) {
      res.render('tier/list', models);
    });
  });

  router.get('/new', function (req, res) {
    Promise.props({
      environment: Environment.findOne({ _id: req.param('environment') }).exec(),
      cfpersonas: CfPersonas.find().exec(),
      networks: Network.find({ environment: req.param('environment') }).exec()
    }).then(function (models) {
      var cloud = models.environment.getCompute();

      models.images = Promise.promisify(cloud.listImages, cloud)();
      models.packages = Promise.promisify(cloud.listPackages, cloud)();

      Promise.props(models).then(function (models) {
        res.render('tier/new', models);
      });
    });
  });

  router.get('/:tier_id', function (req, res) {
    Promise.props({
      tier: Tier.findOne({ _id: req.param('tier_id') }).populate('environment platform cfpersonas').exec(),
      machines: Machine.find({ tier: req.param('tier_id') }).exec()
    }).then(function (models) {
      res.render('tier/show', models);
    });
  });

  router.get('/:tier_id/edit', function (req, res) {
    Promise.props({
      tier: Tier.findOne({ _id: req.param('tier_id') }).populate('environment platform').exec()
    }).then(function (models) {
      var cloud = models.tier.environment.getCompute();

      models.images = Promise.promisify(cloud.listImages, cloud)();
      models.packages = Promise.promisify(cloud.listPackages, cloud)();
      models.networks = Network.find({ environment: models.tier.environment.id }).exec();
      models.cfpersonas = CfPersonas.find().exec()

      Promise.props(models).then(function (models) {
        res.render('tier/edit', models);
      });
    });
  });

  router.post('/', function (req, res) {
    var networks = req.param('networks');
    var home_network = req.param('home_network');

    if (!networks || networks.length === 0) {
      networks = [home_network];
    }

    if (!_.contains(networks, home_network)) {
      networks.push(home_network);
    }

    var tier = new Tier({
      environment: req.param('environment'),
      platform: req.param('platform'),
      cfpersonas: req.param('cfpersonas'),
      name: req.param('name'),
      base_image: req.param('base_image'),
      base_package: req.param('base_package'),
      home_network: home_network,
      networks: networks
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

  router.post('/:tier_id', function (req, res) {
    Promise.props({
      tier: Tier.findOne({ _id: req.param('tier_id') }).exec()
    }).then(function (models) {
      var networks = req.param('networks');
      var home_network = req.param('home_network');

      if (!networks || networks.length === 0) {
        networks = [home_network];
      }

      if (!_.contains(networks, home_network)) {
        networks.push(home_network);
      }

      models.tier.environment = req.param('environment');
      models.tier.platform = req.param('platform');
      models.tier.cfpersonas = req.param('cfpersonas');
      models.tier.name = req.param('name');
      models.tier.base_image = req.param('base_image');
      models.tier.base_package = req.param('base_package');
      models.tier.home_network = home_network;
      models.tier.networks = networks;

      models.tier.save(function (err) {
        if (err) {
          req.flash('error', 'Tier "%s" could not be saved', models.tier.name);
        } else {
          req.flash('success', 'Tier "%s" has been saved', models.tier.name);
        }

        res.redirect('/tier/' + models.tier.id);
      });
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
