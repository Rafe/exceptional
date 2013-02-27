var expect = require('expect.js');

describe("Exceptional", function() {
  var Exceptional = null;
  beforeEach(function() {
    Exceptional = require('../lib/exceptional').Exceptional;
  });

  describe("settings", function() {

    it("has default API_KEY undefined", function() {
      expect(Exceptional.API_KEY).to.be(undefined)
    });

    it("has default protocol version set", function() {
      expect(Exceptional.PROTOCOL_VERSION).to.eql(6)
    });

    it("has default module version set", function() {
      expect(Exceptional.VERSION).to.eql(1.0)
    });

    it("has default host set", function() {
      expect(Exceptional.Host).to.eql('api.getexceptional.com');
    });

    it("has default port set", function() {
      expect(Exceptional.Port).to.eql(80);
    });

    it("can set API key", function() {
      expect(Exceptional.API_KEY).to.be(undefined)
      Exceptional.API_KEY = 'test-api-key'
      expect(Exceptional.API_KEY).to.eql('test-api-key')
    });

  });

  describe("#handle", function() {
    it("requires API_KEY to be set", function() {
      Exceptional.API_KEY = undefined;
      expect(function() {
        Exceptional.handle("error");
      }).to.throwError( /API_KEY must be set/ )
    });
  });

  describe("#error_json", function() {
    beforeEach(function() {
      Exceptional.API_KEY = 'test-api-key'
    });

    it("creates error JSON document with exception details", function() {
      try {
        throw new Error("Big Problem");
      } catch(error) {
        var doc = Exceptional.error_json(error);
        var json = JSON.parse(doc);
        var exception = json.exception

        expect(exception.message).to.eql('Big Problem');
        expect(exception.exception_class).to.eql('node');
        expect(exception.backtrace.length).to.eql(13);
        expect(exception.occurred_at).to.not.be(undefined)
      }
    });

    it("creates error JSON document with client details", function() {
      try {
        throw new Error("Big Problem");
      } catch(error) {
        var doc = Exceptional.error_json(error);
        var json = JSON.parse(doc);

        expect(json.client.name).to.eql("Exceptional for node.js");
        expect(json.client.version).to.eql(1.0);
        expect(json.client.protocol_version).to.eql(6);
      }
    });

    it('creates error JSON document with application environment set', function() {
      try {
        throw new Error("Big Problem");
      } catch(error) {
        var doc = Exceptional.error_json(error);
        var json = JSON.parse(doc);

        expect("node-javascript", json.application_environment.language);
        expect(json.application_environment.application_root_directory).to.not.be(undefined);
        expect(json.application_environment.framework).to.not.be(undefined);
        expect(json.application_environment.env).to.not.be(undefined);
      }
    });
  });

  describe("#send_error", function() {
    before(function() {
      Exceptional.API_KEY = 'test-api-key'
      Exceptional.Host = 'localhost'
      Exceptional.Port = 9876
    })

    it("should send error to exceptional api", function(done) {

      var express = require('express'),
          app = express(),
          zlib = require('zlib');

      app.post('/api/errors', function(req, res) {
        expect(req.query.api_key).to.eql('test-api-key');
        expect(req.query.protocol_version).to.eql('6');

        req.on('data', function(data) {
          zlib.unzip(data, function(err, buffer) {
            expect(JSON.parse(buffer.toString()).exception.message)
              .to.eql('Big Problem');
          });
        });

        res.send('ok');
        done()
      });

      app.listen(9876);

      try {
        throw new Error("Big Problem");
      } catch(error) {
        Exceptional.handle(error)
      }
    });

  });

});


