'use strict';

var mongoose = require('mongoose');
var mongoose_uuid = require('mongoose-uuid');


function platformModel () {
  var platformSchema = mongoose.Schema({
    environment: { type: String, ref: 'Environment', index: true },
    name: { type: String, unique: true },
    system_name: { type: String, unique: true }
  }, { _id: false, versionKey: false });

  platformSchema.plugin(mongoose_uuid.plugin, 'Platform');

  platformSchema.pre('save', function (next) {
    var platform = this;

    if (platform.system_name && platform.system_name.length > 0) {
      next();
      return;
    }

    platform.system_name = platform.name.toLowerCase().replace(/\s+/g, '_');

    next();
  });

  return mongoose.model('Platform', platformSchema);
}

module.exports = new platformModel();
