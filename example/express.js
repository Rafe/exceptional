var Exceptional = require('../lib/exceptional')
    express = require('express'),
    app = express();

Exceptional.API_KEY = 'your-api-key-here';

app.get('/', function(req, res) {
  res.send('ok')
});

app.get('/error', function(req, res, next) {
  next(new Error('Big Problem'));
});

app.use (err, req, res, next)->
  Exceptional.handle(err);
  next();
