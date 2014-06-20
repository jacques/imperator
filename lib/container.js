'use strict';

var container = {};


module.exports = {
  set: function (name, value) {
    container[name] = value;
  },
  get: function (name) {
    return container[name];
  }
};
