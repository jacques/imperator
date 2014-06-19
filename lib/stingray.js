'use strict';

var _ = require('underscore');
var Promise = require('bluebird');
var request = require('request');

var debug = require('debuglog')('stingray');

var TM_API_CONFIG_BASE = '/api/tm/2.0/config/active';
var TM_API_CONFIG_POOLS = TM_API_CONFIG_BASE + '/pools';

var TM_API_STATS_BASE = '/api/tm/2.0/status/local_tm/statistics';
var TM_API_STATS_NODE = TM_API_STATS_BASE + '/nodes/node'; // + node


module.exports = function stingray (options) {
  var opts = _.defaults(options, {
    headers: {
      'Content-Type': 'application/json'
    },
    auth: {},
    base_url: 'https://localhost:9070',
    method: 'GET',
    json: true,
    strictSSL: false
  });

  function _req(uri, options, callback) {
    if (!callback) {
      callback = options;
      options = {};
    }

    var options = _.defaults(options, opts);

    options.url = opts.base_url + uri;

    request(options, function (err, res, data) {
      if (!err && res.statusCode !== 200) {
        debug('got a statusCode other than 200 - maybe authentication failure');
        debug('statusCode: %d', res.statusCode);

        callback(new Error('request failed'), res, data);
        return;
      }

      // forward any other status
      callback(err, res, data);
    });
  }

  function getPools() {
    var deferred = Promise.pending();

    debug('getting names for all pools');

    _req(TM_API_CONFIG_POOLS, function (err, res, data) {
      if (err) {
        debug('ERROR:', err);

        deferred.reject(err);
        return;
      }

      var pool_names = _.map(data.children, function (pool) {
        return pool.name;
      });

      deferred.resolve(pool_names);
    });

    return deferred.promise;
  }

  function getPool(name) {
    var deferred = Promise.pending();

    debug('getting information for pool "%s"', name);

    _req(TM_API_CONFIG_POOLS + '/' + encodeURIComponent(name), function (err, res, data) {
      if (err) {
        debug('ERROR:', err);

        deferred.reject(err);
        return;
      }

      deferred.resolve(data);
    });

    return deferred.promise;
  }

  function addNode(pool, node) {
    var deferred = Promise.pending();

    debug('adding node "%s" to pool "%s"', node, pool);

    getPool(pool)
      .then(function (data) {
        if (_.contains(data.properties.basic.nodes, node)) {
          debug('node already part of pool');

          deferred.resolve(data);
        } else {
          debug('need to update pool configuration');

          data.properties.basic.nodes.push(node);

          var options = {
            method: 'PUT',
            body: JSON.stringify(data)
          };

          _req(TM_API_CONFIG_POOLS + '/' + encodeURIComponent(pool), options, function (err, res, data) {
            if (err) {
              debug('ERROR:', err);

              deferred.reject(err);
              return;
            }

            debug('pool updated sucessfully');

            deferred.resolve(data);
          });
        }
      });

    return deferred.promise;
  }

  function drainNode(pool, node) {
    var deferred = Promise.pending();

    debug('draining node "%s" in pool "%s"', node, pool);

    getPool(pool)
      .then(function (data) {
        if (!_.contains(data.properties.basic.nodes, node)) {
          debug('node is not part of pool');

          deferred.reject(new Error('node is not part of pool'));
        } else if (_.contains(data.properties.basic.draining, node)) {
          debug('node is already draining connections');

          deferred.resolve(data);
        } else {
          debug('need to update pool configuration');

          data.properties.basic.draining.push(node);

          var options = {
            method: 'PUT',
            body: JSON.stringify(data)
          };

          _req(TM_API_CONFIG_POOLS + '/' + encodeURIComponent(pool), options, function (err, res, data) {
            if (err) {
              debug('ERROR:', err);

              deferred.reject(err);
              return;
            }

            debug('pool updated sucessfully');

            deferred.resolve(data);
          });
        }
      });

    return deferred.promise;
  }

  function removeNode(pool, node) {
    var deferred = Promise.pending();

    debug('removing node "%s" from pool "%s"', node, pool);

    getPool(pool)
      .then(function (data) {
        if (!_.contains(data.properties.basic.nodes, node)) {
          debug('node is not part of pool');

          deferred.resolve(data);
        } else {
          debug('need to update pool configuration');

          data.properties.basic.draining = _.without(data.properties.basic.draining, node);
          data.properties.basic.disabled = _.without(data.properties.basic.disabled, node);
          data.properties.basic.nodes = _.without(data.properties.basic.nodes, node);

          var options = {
            method: 'PUT',
            body: JSON.stringify(data)
          };

          _req(TM_API_CONFIG_POOLS + '/' + encodeURIComponent(pool), options, function (err, res, data) {
            if (err) {
              debug('ERROR:', err);

              deferred.reject(err);
              return;
            }

            debug('pool updated sucessfully');

            deferred.resolve(data);
          });
        }
      });

    return deferred.promise;
  }

  function getNodeStats(node) {
    var deferred = Promise.pending();

    debug('getting stats for node "%s"', node);

    _req(TM_API_STATS_NODE + '/' + encodeURIComponent(node), function (err, res, data) {
      if (err) {
        debug('ERROR:', err);

        deferred.reject(err);
        return;
      }

      deferred.resolve(data);
    });

    return deferred.promise;
  }

  return {
    getPools: getPools,
    getPool: getPool,
    addNode: addNode,
    drainNode: drainNode,
    removeNode: removeNode,
    getNodeStats: getNodeStats
  };
};
