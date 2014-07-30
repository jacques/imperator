'use strict';

var Promise = require('bluebird');
var mongoose = require('mongoose');
var debug = require('debuglog')('imperator/tasks');

var container = require('../lib/container');


module.exports = function handleCfenginePersonas () {
  var Environment = mongoose.models.Environment;
  var Machine = mongoose.models.Machine;

  var app = container.get('app');
  var config = container.get('config');
  var cfengine = require('../lib/cfengine')(config.cfengine);

  function _handleMachineCreated(data) {
    debug('event machine:created');

    data.waitForState(['running', 'failed'])
      .then(function (machine) {
        machine.updateFromEnvironment()
          .then(function (machine) {
            if (machine.state === 'running') {
              debug('machine transitioned to running - creating cfengine configuration');
            }

            Promise.props({
              home_ip: machine.getHomeIp(),
              personas: machine.getCfPersonas()
            }).then(function (models) {
              Promise.all([
                cfengine.createHostnameTemplate(models.home_ip, machine.name),
                cfengine.createPersonas(models.home_ip, models.personas)
              ]).then(function () {
                debug('cfengine files were created successfully');
              });
            });
          });
      });
  }

  function _handleMachineDeleted(data) {
    debug('event machine:deleted');

    data.getHomeIp().then(function (home_ip) {
      Promise.all([
        cfengine.removeAll(home_ip)
      ]).then(function () {
        debug('cfengine files were removed');
      });
    });
  }

  return {
    run: function run (interval) {
      debug('attaching to machine:created events');
      app.on('imperator:machine:created', _handleMachineCreated);

      debug('attaching to machine:deleted events');
      app.on('imperator:machine:deleted', _handleMachineDeleted);
    },
    update: function update (cb) {
      debug('noop');

      if (cb) {
        cb(null);
      }
    }
  };
};
