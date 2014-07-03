'use strict';

var _ = require('underscore');
var async = require('async');
var Promise = require('bluebird');
var mongoose = require('mongoose');
var debug = require('debuglog')('imperator/tasks');


module.exports = function updateNetworks () {
  var Environment = mongoose.models.Environment;
  var Network = mongoose.models.Network;

  var _lock = false;

  function _updateNetworksTask() {
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
          debug('updating networks for %s', environment.name);

          var cloud = environment.getCompute();

          cloud.listNetworks(function (err, networks) {
            async.each(networks, function (item, item_done) {
              debug('matching network %s', item.id);

              Network.findOne({ _id: item.id }).exec()
                .then(function (n) {
                  if (!n) {
                    debug('creating new network %s', item.id);

                    n = new Network({
                      _id: item.id,
                      environment: environment.id,
                      name: item.name,
                      public: item.public,
                      last_seen: Date.now()
                    });
                  } else {
                    debug('updating network %s', n.id);

                    n.last_seen = Date.now();
                  }

                  n.save(item_done);
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
      setInterval(_updateNetworksTask, 1000 * (interval || 60));

      // run async on next tick
      process.nextTick(_updateNetworksTask);
    },
    update: function update (cb) {
      debug('forcing an update');

      _updateNetworksTask();

      if (cb) {
        cb(null);
      }
    }
  };
};
