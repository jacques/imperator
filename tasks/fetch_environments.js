'use strict';

var _ = require('underscore');
var async = require('async');
var Promise = require('bluebird');
var mongoose = require('mongoose');
var debug = require('debuglog')('imperator/tasks');


module.exports = function fetchEnvironments () {
  var Environment = mongoose.models.Environment;
  var Platform = mongoose.models.Platform;
  var Tier = mongoose.models.Tier;
  var Machine = mongoose.models.Machine;

  var _lock = false;

  function _fetchEnvironmentsTask() {
    debug('starting update');

    if (_lock) {
      debug('skipping because lock is set');

      return false;
    }

    try {
      debug('acquiring lock');

      _lock = true;

      Promise.props({
        environments: Environment.find().exec()
      }).then(function (models) {
        async.each(models.environments, function iterEnvironment(environment, done) {
          debug('updating %s', environment.name);

          var cloud = environment.getCompute();

          cloud.listMachines(function (err, machines) {
            async.each(machines, function (item, item_done) {
              debug('matching machine %s', item.id);

              Machine.findOne({ machine_uuid: item.id }).exec()
                .then(function (m) {
                  if (!m) {
                    debug('creating new machine for %s', item.id);

                    m = new Machine({
                      environment: environment.id,
                      last_seen: Date.now(),
                      name: item.name,
                      tags: item.tags,
                      machine_uuid: item.id,
                      created: item.created,
                      updated: item.updated,
                      state: item.state || 'unknown'
                    });
                  }

                  debug('updating machine %s for %s', m.id, item.id);

                  m.updateFromEnvironment()
                    .then(function (machine) {
                      item_done(null, machine);
                    })
                    .error(function (err) {
                      item_done(err, machine);
                    });
                });
            }, function (err) {
              done(err);
            });
          });
        }, function callback(err) {
          debug('releasing lock');

          _lock = false;
        });
      });
    } catch (err) {
      debug('releasing lock');

      _lock = false;
    }
  }

  return {
    run: function run (interval) {
      setInterval(_fetchEnvironmentsTask, 1000 * (interval || 1800));

      // run async on next tick
      process.nextTick(_fetchEnvironmentsTask);
    },
    update: function update (cb) {
      debug('forcing an update');

      _fetchEnvironmentsTask();

      if (cb) {
        cb(null);
      }
    }
  };
};
