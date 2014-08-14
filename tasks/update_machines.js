'use strict';

var async = require('async');
var mongoose = require('mongoose');
var debug = require('debuglog')('imperator/tasks');


module.exports = function updateMachines () {
  var Machine = mongoose.models.Machine;

  var _lock = false;

  function _updateMachinesTask() {
    debug('starting update');

    if (_lock) {
      debug('skipping because lock is set');

      return false;
    }

    try {
      debug('acquiring lock');

      _lock = true;

      Machine.find({ managed: true, state: { $ne: 'destroyed' } }, function (err, machines) {
        async.each(machines, function iterMachines(machine, next) {
          debug('updating machine %s', machine.name);

          machine.updateFromEnvironment()
            .then(function () {
              next();
            }, function (err) {
              next(err);
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
      setInterval(_updateMachinesTask, 1000 * (interval || 600));

      // run async on next tick
      process.nextTick(_updateMachinesTask);
    },
    update: function update (cb) {
      debug('forcing an update');

      _updateMachinesTask();

      if (cb) {
        cb(null);
      }
    }
  };
};
