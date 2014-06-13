'use strict';

var mongoose = require('mongoose');
var mongoose_uuid = require('mongoose-uuid');
var bcrypt = require('bcrypt');


function userModel () {
  var userSchema = mongoose.Schema({
    username: { type: String, unique: true },
    password: { type: String },
    roles: [{ type: String }]
  }, { _id: false, versionKey: false });

  userSchema.plugin(mongoose_uuid.plugin, 'User');

  userSchema.path('username').validate(function (name) {
    return name.length > 0;
  }, 'Username cannot be blank');

  userSchema.pre('save', function (next) {
    var user = this;

    if (!user.isModified('password')) {
      next();
      return;
    }

    user.password = bcrypt.hashSync(user.password, 12);

    next();
  });

  userSchema.methods.passwordMatches = function (plainText) {
    var user = this;
    return bcrypt.compareSync(plainText, user.password);
  };

  return mongoose.model('User', userSchema);
}

module.exports = new userModel();
