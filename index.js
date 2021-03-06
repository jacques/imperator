'use strict';

var http = require('http');

var Promise = require('bluebird');
var express = require('express');

var bootstrap = require('./lib/system/bootstrap');

var log = require('bunyan').createLogger({
  name: 'imperator',
  stream: process.stdout,
  level: 'info'
});

var app = express();
var options = {
  config_file: __dirname + '/config.json',
  env: process.env.NODE_ENV || 'development'
};

app.use(require('express-bunyan-logger')({
  name: 'logger',
  streams: [{
    level: 'info',
    stream: process.stdout
  }]
}));
app.use('/', bootstrap(options));

var server = http.createServer(app);

server.listen(process.env.PORT || 8000, function server_running () {
  console.log('Server started on port %s at %s', server.address().port, server.address().address);
});
