'use strict';

var Promise = require('bluebird');
var mongoose = require('mongoose');


module.exports = function (router) {
  var Environment = mongoose.models.Environment;
  var Platform = mongoose.models.Platform;
  var Tier = mongoose.models.Tier;
  var Machine = mongoose.models.Machine;

  router.post('/:machine_id/set_tier', function (req, res) {
    Promise.props({
      machine: Machine.findOne({ _id: req.param('machine_id') }).populate('environment platform tier').exec(),
      tier: Tier.findOne({ _id: req.param('tier') }).populate('environment platform').exec()
    }).then(function (models) {
      models.machine.addTag('imperator_tier', models.tier.id)
        .then(function (machine) {
          machine.tier = models.tier.id;
          machine.platform = models.tier.platform.id;

          machine.save(function (err, machine) {
            if (err) {
              res.render('error', {
                message: 'set_tier failed',
                error: err,
                url: req.url
              });

              return;
            }

            req.flash('success', 'Machine "%s" has been added to tier "%s"', machine.name, models.tier.name);

            res.redirect('/machine/' + machine.id);
          });
        });
    });
  });
};
