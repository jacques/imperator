'use strict';

var path = require('path');

var debug = require('debuglog')('imperator/settings');

var container = require('../container');


module.exports = function initSettings (app, options) {
  debug('init settings');

  var config = require('./config');

  container.set('app', app);

  var serveFavicon = require('serve-favicon');
  var serveStatic = require('serve-static');
  var cookieParser = require('cookie-parser');
  var bodyParser = require('body-parser');
  var methodOverride = require('method-override');
  var session = require('express-session');
  var MongoStore = require('connect-mongo')(session);
  var flash = require('connect-flash');

  function complete(config) {
    debug('loaded config:', config);

    for (var k in options) {
      if (!config[k]) {
        config[k] = options[k];
      }
    }

    debug('merged options:', config);

    container.set('config', config);

    app.set('config', config);

    app.set('views', path.join(__dirname, '/../../views'));
    app.set('view engine', 'jade');

    app.set('x-powered-by', false);

    app.use(serveFavicon('public/favicon.ico'));
    app.use(serveStatic('public'));
    app.use(bodyParser());
    app.use(methodOverride(function (req, res) {
      var method = req.param('_method');

      if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        delete req.body._method;
      }

      return method;
    }));
    app.use(cookieParser(config.session.secret));
    app.use(session({
      secret: config.session.secret,
      store: new MongoStore(config.session.opts)
    }));
    app.use(flash());

    return app;
  }

  return config.load(options)
    .then(complete);
};
