'use strict';

var mongoose = require('mongoose');
var mongoose_uuid = require('mongoose-uuid');


function personasModel () {
  var personasSchema = mongoose.Schema({
    name: { type: String },
    system_name: { type: String },
    classes: [{ type: String, index: true }]
  }, { _id: false, versionKey: false });

  personasSchema.plugin(mongoose_uuid.plugin, 'CfPersonas');

  personasSchema.pre('save', function (next) {
    var personas = this;

    if (personas.system_name && personas.system_name.length > 0) {
      next();
      return;
    }

    personas.system_name = personas.name.toLowerCase().replace(/\s+/g, '_');

    next();
  });

  return mongoose.model('CfPersonas', personasSchema);
}

module.exports = new personasModel();
