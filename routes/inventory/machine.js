'use strict';

var Promise = require('bluebird');
var mongoose = require('mongoose');
var uuid = require('uuid');

var container = require('../../lib/container');


module.exports = function (router) {
  var Tier = mongoose.models.Tier;
  var Machine = mongoose.models.Machine;

  var app = container.get('app');

  router.get('/', function (req, res) {
    Promise.props({
      machines: Machine.find().sort({ name: 1 }).exec()
    }).then(function (models) {
      res.render('machine/list', models);
    });
  });

  router.get('/new', function (req, res) {
    res.render('machine/new', {
      machine: new Machine()
    });
  });

  router.get('/:machine_id', function (req, res) {
    Promise.props({
      machine: Machine.findOne({ _id: req.param('machine_id') }).populate('environment platform tier').exec()
    }).then(function (models) {
      models.tiers = Tier.find({ environment: models.machine.environment.id }).sort({ name: 1 }).exec();

      Promise.props(models).then(function (models) {
        res.render('machine/show', models);
      });
    });
  });

  router.post('/', function (req, res) {
    var name = req.param('name') || '';
    var count = req.param('count') || 1;
    var machines = [];

    for (var i = 0; i < count; i++) {
      var machine_name = name;

      if (count > 0 && name.length > 0) {
        machine_name += '-' + uuid.v1().split(/-/)[0];
      }

      var machine = new Machine({
        environment: req.param('environment'),
        platform: req.param('platform'),
        tier: req.param('tier'),
        name: machine_name
      });

      var promise = machine.create()
        .then(function (machine) {
          app.emit('imperator:machine:created', machine);

          req.flash('success', 'Machine "%s" has been created', machine.name);
        });

      machines.push(promise);
    }

    Promise.settle(machines)
      .then(function() {
        res.redirect('/tier/' + req.param('tier'));
      })
      .catch(function (err) {
        res.render('error', {
          message: 'save failed',
          error: err,
          url: req.url
        });
      });
  });

  router.delete('/:machine_id', function (req, res) {
    Promise.props({
      machine: Machine.findOne({ _id: req.param('machine_id') }).exec()
    }).then(function (models) {
      if (models.machine.state === 'destroyed') {
        models.machine.remove(function (err) {
          app.emit('imperator:machine:deleted', models.machine);

          req.flash('success', 'Machine "%s" has been removed from database', models.machine.name);

          res.redirect('/tier/' + models.machine.tier);
        });
      } else {
        models.machine.delete()
          .then(function (machine) {
            app.emit('imperator:machine:deleted', models.machine);

            req.flash('success', 'Machine "%s" has been deleted', models.machine.name);

            res.redirect('/machine/' + machine.id);
          })
          .catch(function (err) {
            res.render('error', {
              message: 'delete failed',
              error: err,
              url: req.url
            });
          });
      }
    });
  });
};
