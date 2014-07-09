'use strict';

var Promise = require('bluebird');
var mongoose = require('mongoose');


module.exports = function (router) {
  var CfPersonas = mongoose.models.CfPersonas;

  router.get('/', function (req, res) {
    Promise.props({
      personas: CfPersonas.find().sort({ name: 1 }).exec()
    }).then(function (models) {
      res.render('cf/personas/list', models);
    });
  });

  router.get('/new', function (req, res) {
    res.render('cf/personas/new');
  });

  router.get('/:personas_id', function (req, res) {
    Promise.props({
      personas: CfPersonas.findOne({ _id: req.param('personas_id') }).exec()
    }).then(function (models) {
      res.render('cf/personas/show', models);
    });
  });

  router.get('/:personas_id/edit', function (req, res) {
    Promise.props({
      personas: CfPersonas.findOne({ _id: req.param('personas_id') }).exec()
    }).then(function (models) {
      res.render('cf/personas/edit', models);
    });
  });

  router.post('/', function (req, res) {
    var personas = new CfPersonas({
      name: req.param('name'),
      classes: req.param('classes')
    });

    personas.save(function (err) {
      if (err) {
        res.render('error', {
          message: 'save failed',
          error: err,
          url: req.url
        });

        return;
      }

      req.flash('success', 'cfEngine personas "%s" has been created', personas.name);

      res.redirect('/cf/personas/' + personas.id);
    });
  });

  router.post('/:personas_id', function (req, res) {
    Promise.props({
      personas: CfPersonas.findOne({ _id: req.param('personas_id') }).exec()
    }).then(function (models) {
      models.personas.name = req.param('name');
      models.personas.classes = req.param('classes');

      models.personas.save(function (err) {
        if (err) {
          req.flash('error', 'cfEngine personas "%s" could not be saved', models.personas.name);
        } else {
          req.flash('success', 'cfEngine personas "%s" has been saved', models.personas.name);
        }

        res.redirect('/cf/personas/' + models.personas.id);
      });
    });
  });

  router.delete('/:personas_id', function (req, res) {
    Promise.props({
      personas: CfPersonas.findOne({ _id: req.param('personas_id') }).exec()
    }).then(function (models) {
      models.personas.remove();

      req.flash('success', 'cfEngine personas "%s" has been deleted', models.personas.name);

      res.redirect('/cf/personas');
    });
  });
};
