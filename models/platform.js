'use strict';

var mongoose = require('mongoose');
var mongoose_uuid = require('mongoose-uuid');
var mongoose_relationship = require('mongoose-relationship');


function platformModel () {
  var platformSchema = mongoose.Schema({
    environment: { type: String, ref: 'Environment', childPath: 'platforms', index: true },
    tiers: [{ type: String, ref: 'Tier' }],
    machines: [{ type: String, ref: 'Machine' }],
    name: { type: String, unique: true },
    system_name: { type: String, unique: true }
  }, { _id: false, versionKey: false });

  platformSchema.plugin(mongoose_uuid.plugin, 'Platform');
  platformSchema.plugin(mongoose_relationship, {
    relationshipPathName: 'environment'
  });

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
