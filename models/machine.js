'use strict';

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

    if (machine.system_name && machine.system_name.length > 0) {
      next();
      return;
    }

    machine.system_name = machine.name.toLowerCase().replace(/\s+/g, '_');

    next();
  });

  return mongoose.model('Machine', machineSchema);
}

module.exports = new machineModel();
