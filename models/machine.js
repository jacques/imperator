'use strict';

var _ = require('underscore');
var Promise = require('bluebird');
var mongoose = require('mongoose');
var mongoose_uuid = require('mongoose-uuid');
var uuid = require('uuid');


function machineModel () {
  var machineEventSchema = mongoose.Schema({
    _id: {
      type: String,
      index: {
        unique: true,
        sparse: true
      }
    },
    type: {
      type: String,
      enum: [
        'info',
        'start',
        'shutdown',
        'destruct'
      ],
      default: 'info'
    },
    timestamp: { type: Date, index: true },
    message: { type: String },
    meta: {}
  }, { _id: false, versionKey: false });

  machineEventSchema.plugin(mongoose_uuid.plugin, 'MachineEvent');

  var MachineEvent = mongoose.model('MachineEvent', machineEventSchema);

  var machineSchema = mongoose.Schema({
    name: { type: String, default: uuid.v4 },
    machine_uuid: { type: String },
    state: {
      type: String,
      enum: [
        'unknown',
        'provisioning',
        'running',
        'stopped',
        'destroyed'
      ],
      default: 'unknown'
    },
    created: { type: Date, index: true },
    updated: { type: Date, index: true },
    tags: {},
    ips: {},
    primary_ip: { type: String },

    // internal fields
    environment: { type: String, ref: 'Environment', index: true },
    platform: { type: String, ref: 'Platform', index: true },
    tier: { type: String, ref: 'Tier', index: true },
    managed: { type: Boolean, default: false, index: true },
    last_seen: { type: Date, index: true },
    events: [ machineEventSchema ]
  }, { _id: false, versionKey: false });

  machineSchema.plugin(mongoose_uuid.plugin, 'Machine');

  machineSchema.pre('save', function (next) {
    var machine = this;

    if (!machine.tags) {
      machine.tags = {};
    }

    if (machine.system_name && machine.system_name.length > 0) {
      next();
      return;
    }

    machine.system_name = machine.name.toLowerCase().replace(/\s+/g, '_');

    next();
  });

  machineSchema.methods.addEvent = function (type, message, meta) {
    var machine = this;
    var deferred = Promise.pending();

    if (!meta) {
      meta = {};
    }

    machine.events.unshift(new MachineEvent({
      type: type,
      timestamp: new Date(),
      message: message,
      meta: meta
    }));

    machine.save(function (err, machine) {
      if (err) {
        deferred.reject(err);
      } else {
        deferred.resolve(machine);
      }
    });

    return deferred.promise;
  };

  machineSchema.methods.waitForState = function (states) {
    var machine = this;
    var deferred = Promise.pending();

    if (_.isString(states)) {
      states = [states];
    }

    this.populate('environment tier', function (err, machine) {
      var cloud = machine.environment.getCompute();

      var _wait = setInterval(function() {
        cloud.getMachine(machine.machine_uuid, function (err, obj) {
          if (err) {
            deferred.reject(err);
          } else if (_.contains(states, obj.state)) {
            clearInterval(_wait);

            machine.state = obj.state;
            machine.created = obj.created;
            machine.updated = obj.updated;
            machine.last_seen = Date.now();

            deferred.resolve(machine);
          }
        });
      }, 1000);
    });

    return deferred.promise;
  };

  machineSchema.methods.create = function () {
    var machine = this;
    var deferred = Promise.pending();

    this.populate('environment tier', function (err, machine) {
      var cloud = machine.environment.getCompute();

      if (!machine.tags) {
        machine.tags = {};
      }

      if (!machine.tags.imperator_tier) {
        machine.tags.imperator_tier = machine.tier.id;
      }

      var opts = {
        name: machine.name,
        image: machine.tier.base_image,
        package: machine.tier.base_package
      };

      var k;
      for (k in machine.tags) {
        opts['tag.' + k] = machine.tags[k];
      }

      deferred.promise.then(function (machine) {
        machine.addEvent(
          'start',
          'machine created in tier "' + machine.tier.name + '"');
      });

      cloud.createMachine(opts, function (err, obj) {
        if (err) {
          deferred.reject(err);
        } else {
          machine.machine_uuid = obj.id;
          machine.managed = true;
          machine.state = obj.state;
          machine.created = obj.created;
          machine.updated = obj.updated;
          machine.last_seen = Date.now();

          machine.save(function (err, machine) {
            if (err) {
              deferred.reject(err);
            } else {
              deferred.resolve(machine);
            }
          });
        }
      });
    });

    return deferred.promise;
  };

  machineSchema.methods.delete = function () {
    var machine = this;
    var deferred = Promise.pending();

    deferred.promise.then(function (machine) {
      machine.addEvent(
        'destruct',
        'machine destroyed');
    });

    this.populate('environment tier', function (err, machine) {
      var cloud = machine.environment.getCompute();

      cloud.deleteMachine(machine.machine_uuid, function (err, obj) {
        if (err) {
          deferred.reject(err);
        } else {
          machine.state = 'destroyed';

          machine.save(function (err, machine) {
            if (err) {
              deferred.reject(err);
            } else {
              deferred.resolve(machine);
            }
          });
        }
      });
    });

    return deferred.promise;
  };

  machineSchema.methods.addTag = function (name, value) {
    var machine = this;
    var deferred = Promise.pending();

    this.populate('environment', function (err, machine) {
      var cloud = machine.environment.getCompute();

      if (!machine.tags) {
        machine.tags = {};
      }

      machine.tags[name] = value;

      cloud.addMachineTags(machine.machine_uuid, machine.tags, function (err, obj) {
        if (err) {
          deferred.reject(err);
        } else {
          machine.save(function (err, machine) {
            if (err) {
              deferred.reject(err);
            } else {
              deferred.resolve(machine);
            }
          });
        }
      });
    });

    return deferred.promise;
  };

  return mongoose.model('Machine', machineSchema);
}

module.exports = new machineModel();
