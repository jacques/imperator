'use strict';

var mongoose = require('mongoose');
var mongoose_uuid = require('mongoose-uuid');


function tierModel () {
  var tierSchema = mongoose.Schema({
    environment: { type: String, ref: 'Environment', index: true },
    platform: { type: String, ref: 'Platform', index: true },
    name: { type: String },
    system_name: { type: String },
    base_image: { type: String },
    base_package: { type: String },
    home_network: { type: String }
  }, { _id: false, versionKey: false });

  tierSchema.plugin(mongoose_uuid.plugin, 'Tier');

  tierSchema.pre('save', function (next) {
    var tier = this;

    if (tier.system_name && tier.system_name.length > 0) {
      next();
      return;
    }

    tier.system_name = tier.name.toLowerCase().replace(/\s+/g, '_');

    next();
  });

  return mongoose.model('Tier', tierSchema);
}

module.exports = new tierModel();
