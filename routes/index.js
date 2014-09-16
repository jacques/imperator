'use strict';

var Promise = require('bluebird');
var mongoose = require('mongoose');


module.exports = function (router) {
  var Environment = mongoose.models.Environment;

  router.get('/', function (req, res) {
    Promise.props({
      environments: Environment.find().populate('platforms').sort({ name: 1 }).exec()
    }).then(function (models) {
      res.render('index', models);
    });
  });
};
