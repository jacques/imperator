'use strict';

var _ = require('underscore');
var async = require('async');
var Promise = require('bluebird');
var mongoose = require('mongoose');
var debug = require('debuglog')('imperator/tasks');


module.exports = function updateEnvironments () {
  var Environment = mongoose.models.Environment;
  var Platform = mongoose.models.Platform;
  var Tier = mongoose.models.Tier;
  var Machine = mongoose.models.Machine;

  var _lock = false;

  function _updateEnvironmentsTask() {
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
                  } else {
                    debug('updating machine %s for %s', m.id, item.id);

                    if (item.state) {
                      m.state = item.state;
                    }
                    if (item.tags) {
                      m.tags = item.tags;
                    }
                    m.created = item.created;
                    m.updated = item.updated;
                    m.last_seen = Date.now();
                  }

                  // rebuild networks -> ip mapping
                  m.ips = {};
                  item.networks.forEach(function (network, index) {
                    m.ips[network] = item.ips[index];
                  });

                  // reset primary_ip if we got one from the API
                  if (item.primaryIp) {
                    m.primary_ip = item.primaryIp;
                  }

                  m.save(item_done);
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
      setInterval(_updateEnvironmentsTask, 1000 * (interval || 60));

      // run async on next tick
      process.nextTick(_updateEnvironmentsTask);
    },
    update: function update (cb) {
      debug('forcing an update');

      _updateEnvironmentsTask();

      if (cb) {
        cb(null);
      }
    }
  };
};
