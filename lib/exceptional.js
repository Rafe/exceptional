var http = require('http');
var gzip = require('./gzip').gzip;
var fs = require('fs');

var Exceptional = {

  API_KEY: undefined,
  PROTOCOL_VERSION: 6,
  VERSION: 1.0,
  VERBOSE: true,

  Host: "api.getexceptional.com",
  Port: 80,

  handle: function(error) {
    if (Exceptional.API_KEY == undefined) {
      throw "API_KEY must be set";
    }

    var doc = Exceptional.errorJson(error);
    Exceptional.sendError(doc);
  },

  errorJson: function(error) {
    return JSON.stringify({
      "application_environment": {
        "application_root_directory": process.cwd(),
        "language": "node-javascript",
        "framework": "node" + process.version,
        "env": {
          "args": process.argv,
          "execPath": process.execPath,
          "cwd": process.cwd(),
          "env": process.env,
          "gid": process.getgid(),
          "uid": process.getuid(),
          "version": process.version,
          "installPrefix": process.installPrefix,
          "pid": process.pid,
          "platform": process.platform,
          "memory": process.memoryUsage()
        }
      },

      "exception": {
        "occurred_at": new Date(),
        "message": error.message,
        "backtrace": error.stack.split("\n"),
        "exception_class": "node"
      },
      "client": {
        "name": "Exceptional for node.js",
        "version": Exceptional.VERSION,
        "protocol_version": Exceptional.PROTOCOL_VERSION
      }
    });
  },

  sendError: function(doc) {
    gzip(doc, 1, function(err, data) {

      var headers = {
        'Host' : Exceptional.Host,
        'Content-Length' : data.length
      };

      var options  = ({
        'hostname': Exceptional.Host,
        'port': Exceptional.Port,
        'method': 'POST',
        'headers': headers,
        'path': '/api/errors?api_key=' + Exceptional.API_KEY + "&protocol_version=" + Exceptional.PROTOCOL_VERSION
      });

      var request = http.request(options);

      request.on('response', function (response) {
        if (response.statusCode === 200) {
          if (Exceptional.VERBOSE) console.log("Error data successfully sent to exceptional");
        } else {
          if (Exceptional.VERBOSE) console.log("Error sending to api.getexceptional.com :" + response.statusCode);
        }
      });

      request.write(data);
      request.end();
    });
  },

  errorHandler: function(err, req, res, next) {
    Exceptional.handle(err);
    next()
  }
};

module.exports = Exceptional;
