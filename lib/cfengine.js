'use strict';

var child_process = require('child_process');
var path = require('path');

var _ = require('underscore');
var Promise = require('bluebird');
var fs = require('fs.extra');

var debug = require('debuglog')('cfengine');


module.exports = function cfengine (options) {
  var opts = _.defaults(options, {
    runagent_bin_path: '/var/cfengine/bin/cf-runagent',
    masterfiles_path: '/var/cfengine/masterfiles'
  });

  function removeAll(id) {
    var deferred = Promise.pending();

    var remotes_path = path.join(opts.masterfiles_path, 'unique', id);

    fs.rmrf(remotes_path, function (err) {
      if (err) {
        debug('failed to remove remote directory for id: %s', id);

        deferred.reject(err);
        return;
      }

      deferred.resolve();
    });

    return deferred.promise;
  }

  function createPersonas(id, classes) {
    var deferred = Promise.pending();

    var remotes_path = path.join(opts.masterfiles_path, 'unique', id, 'remote');

    function _create() {
      fs.writeFile(path.join(remotes_path, 'machine.personas'), classes.join('\n'), function (err) {
        if (err) {
          debug('failed to create personas file for id: %s', id);

          deferred.reject(err);
          return;
        }

        deferred.resolve();
      });
    }

    fs.exists(remotes_path, function (exists) {
      if (!exists) {
        fs.mkdirp(remotes_path, function (err) {
          if (err) {
            debug('failed to create remote directory for id: %s', id);

            deferred.reject(err);
            return;
          }

          _create();
        });
      } else {
        _create();
      }
    });

    return deferred.promise;
  }

  function createHostnameTemplate(id, name) {
    var deferred = Promise.pending();

    var remotes_path = path.join(opts.masterfiles_path, 'unique', id, 'remote');

    function _create() {
      fs.writeFile(path.join(remotes_path, 'hostname.tpl'), name, function (err) {
        if (err) {
          debug('failed to create hostname template for id: %s', id);

          deferred.reject(err);
          return;
        }

        deferred.resolve();
      });
    }

    fs.exists(remotes_path, function (exists) {
      if (!exists) {
        fs.mkdirp(remotes_path, function (err) {
          if (err) {
            debug('failed to create remote directory for id: %s', id);

            deferred.reject(err);
            return;
          }

          _create();
        });
      } else {
        _create();
      }
    });

    return deferred.promise;
  }

  function runAgent(id) {
    var deferred = Promise.pending();

    child_process.execFile(opts.runagent_bin_path, ['--hail', id],
      function (err, stdout, stderr) {
        if (err) {
          deferred.reject(err);

          return;
        }

        deferred.resolve(stdout);
      });

    return deferred.promise;
  }

  return {
    runAgent: runAgent,
    removeAll: removeAll,
    createPersonas: createPersonas,
    createHostnameTemplate: createHostnameTemplate
  };
};
