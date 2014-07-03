'use strict';

var Promise = require('bluebird');
var mongoose = require('mongoose');


module.exports = function (router) {
  var Network = mongoose.models.Network;

  router.get('/', function (req, res) {
    Promise.props({
      networks: Network.find().sort({ name: 1 }).exec()
    }).then(function (models) {
      res.render('network/list', models);
    });
  });

  router.get('/:network_id', function (req, res) {
    Promise.props({
      network: Network.findOne({ _id: req.param('network_id') }).populate('environment').exec()
    }).then(function (models) {
      res.render('network/show', models);
    });
  });

  router.get('/:network_id/edit', function (req, res) {
    Promise.props({
      network: Network.findOne({ _id: req.param('network_id') }).populate('environment').exec()
    }).then(function (models) {
      res.render('network/edit', models);
    });
  });

  router.post('/:network_id', function (req, res) {
    Promise.props({
      network: Network.findOne({ _id: req.param('network_id') }).populate('environment').exec()
    }).then(function (models) {
      models.network.name = req.param('name');
      models.network.subnet = req.param('subnet');
      models.network.broadcast = req.param('broadcast');
      models.network.start_ip = req.param('start_ip');
      models.network.end_ip = req.param('end_ip');

      models.network.save(function (err) {
        if (err) {
          req.flash('error', 'Network "%s" could not be saved', models.network.name);
        } else {
          req.flash('success', 'Network "%s" has been saved', models.network.name);
        }

        res.redirect('/network/' + models.network.id);
      });
    });
  });

  router.delete('/:network_id', function (req, res) {
    Promise.props({
      network: Network.findOne({ _id: req.param('network_id') }).exec()
    }).then(function (models) {
      models.network.remove();

      req.flash('success', 'Network "%s" has been deleted', models.network.name);

      res.redirect('/network');
    });
  });
};
