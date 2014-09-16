'use strict';

var mongoose = require('mongoose');
var mongoose_uuid = require('mongoose-uuid');
var smartdc = require('smartdc');


function environmentModel () {
  var environmentSchema = mongoose.Schema({
    platforms: [{ type: String, ref: 'Platform' }],
    tiers: [{ type: String, ref: 'Tier' }],
    machines: [{ type: String, ref: 'Machine' }],
    name: { type: String, unique: true },
    system_name: { type: String, unique: true },
    pkgcloud_options: {}
  }, { _id: false, versionKey: false });

  environmentSchema.plugin(mongoose_uuid.plugin, 'Environment');

  environmentSchema.pre('save', function (next) {
    var environment = this;

    if (environment.system_name && environment.system_name.length > 0) {
      next();
      return;
    }

    environment.system_name = environment.name.toLowerCase().replace(/\s+/g, '_');

    next();
  });

  var _cacheCloudClient = {};

  environmentSchema.methods.getCompute = function () {
    var environment = this;

    if (_cacheCloudClient[environment.id]) {
      return _cacheCloudClient[environment.id];
    }

    var options = {
      user: environment.pkgcloud_options.account,
      url: environment.pkgcloud_options.url,
      cacheExpiry: environment.pkgcloud_options.cacheExpiry || 60
    };

    if (!options.url.match(/^https?:\/\//)) {
      options.url = 'https://' + options.url;
    }

    if (environment.pkgcloud_options.key) {
      options.sign = smartdc.privateKeySigner({
        key: environment.pkgcloud_options.key,
        keyId: environment.pkgcloud_options.keyId,
        user: environment.pkgcloud_options.account
      });
    } else {
      options.sign = smartdc.sshAgentSigner({
        keyId: environment.pkgcloud_options.keyId,
        user: environment.pkgcloud_options.account
      });
    }

    _cacheCloudClient[environment.id] = smartdc.createClient(options);

    return _cacheCloudClient[environment.id];
  };

  return mongoose.model('Environment', environmentSchema);
}

module.exports = new environmentModel();
