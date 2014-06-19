'use strict';

var Promise = require('bluebird');
var mongoose = require('mongoose');


module.exports = function (router) {
  var Stingray = mongoose.models.Stingray;

  router.get('/', function (req, res) {
    Promise.props({
      stingrays: Stingray.find().sort({ name: 1 }).exec()
    }).then(function (models) {
      res.render('stingray/list', models);
    });
  });

  router.get('/new', function (req, res) {
    res.render('stingray/new');
  });

  router.get('/:stingray_id', function (req, res) {
    Promise.props({
      stingray: Stingray.findOne({ _id: req.param('stingray_id') }).populate('environment').exec()
    }).then(function (models) {
      res.render('stingray/show', models);
    });
  });

  router.post('/', function (req, res) {
    var stingray = new Stingray({
      environment: req.param('environment'),
      name: req.param('name'),
      url: req.param('url'),
      username: req.param('username'),
      password: req.param('password')
    });

    stingray.save(function (err) {
      if (err) {
        res.render('error', {
          message: 'save failed',
          error: err,
          url: req.url
        });

        return;
      }

      req.flash('success', 'Stingray "%s" has been created', stingray.name);

      res.redirect('/stingray/' + stingray.id);
    });
  });

  router.delete('/:stingray_id', function (req, res) {
    Promise.props({
      stingray: Stingray.findOne({ _id: req.param('stingray_id') }).exec()
    }).then(function (models) {
      models.stingray.remove();

      req.flash('success', 'Stingray "%s" has been deleted', models.stingray.name);

      res.redirect('/stingray');
    });
  });
};
