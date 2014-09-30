var fs = require('fs');

exports['checks-that-config.json-exists'] = function(t) {
  t.ok(fs.existsSync(__dirname + '/../config.json'));
  t.done()
};
