'use strict';

var Promise = require('bluebird');
var mongoose = require('mongoose');


module.exports = function (router) {
  var Machine = mongoose.models.Machine;

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
      res.render('machine/show', models);
    });
  });

  router.post('/', function (req, res) {
    var machine = new Machine({
      environment: req.param('environment'),
      platform: req.param('platform'),
      tier: req.param('tier'),
      name: req.param('name')
    });

    machine.save(function (err) {
      if (err) {
        res.render('error', {
          message: 'save failed',
          error: err,
          url: req.url
        });

        return;
      }

      req.flash('success', 'Machine "%s" has been created', machine.name);

      res.redirect('/machine/' + machine.id);
    });
  });

  router.delete('/:machine_id', function (req, res) {
    Promise.props({
      machine: Machine.findOne({ _id: req.param('machine_id') }).exec()
    }).then(function (models) {
      models.machine.remove();

      req.flash('success', 'Machine "%s" has been deleted', models.machine.name);

      res.redirect('/machine');
    });
  });
};
