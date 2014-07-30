'use strict';

var mongoose = require('mongoose');


function networkModel () {
  var networkSchema = mongoose.Schema({
    _id: {
      type: String,
      index: {
        unique: true,
        sparse: true
      }
    },
    environment: { type: String, ref: 'Environment', index: true },
    name: { type: String },
    system_name: { type: String },
    order: { type: Number, default: 0, index: true },
    public: { type: Boolean },
    subnet: { type: String },
    broadcast: { type: String },
    start_ip: { type: String },
    end_ip: { type: String },
    last_seen: { type: Date, index: true }
  }, { _id: false, versionKey: false });

  networkSchema.pre('save', function (next) {
    var network = this;

    if (network.system_name && network.system_name.length > 0) {
      next();
      return;
    }

    if (!network.name) {
      next();
      return;
    }

    network.system_name = network.name.toLowerCase().replace(/\s+/g, '_');

    next();
  });

  return mongoose.model('Network', networkSchema);
}

module.exports = new networkModel();
