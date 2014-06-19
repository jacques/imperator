'use strict';

var mongoose = require('mongoose');
var mongoose_uuid = require('mongoose-uuid');


function stingrayModel () {
  var stingraySchema = mongoose.Schema({
    environment: { type: String, ref: 'Environment', index: true },
    name: { type: String },
    system_name: { type: String },
    url: { type: String },
    username: { type: String },
    password: { type: String }
  }, { _id: false, versionKey: false });

  stingraySchema.plugin(mongoose_uuid.plugin, 'Stingray');

  stingraySchema.pre('save', function (next) {
    var stingray = this;

    if (stingray.system_name && stingray.system_name.length > 0) {
      next();
      return;
    }

    stingray.system_name = stingray.name.toLowerCase().replace(/\s+/g, '_');

    next();
  });

  return mongoose.model('Stingray', stingraySchema);
}

module.exports = new stingrayModel();
