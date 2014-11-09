/*globals describe, before, beforeEach, it, after*/
require('should');
var supertest, app, History;

supertest = require('supertest');
app = require('../index.js');
History = require('../models/history');

describe('history controller', function () {
  'use strict';

  describe('create', function () {
    before(History.remove.bind(History));

    describe('without token', function () {
      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.post('/users/111111/histories');
        request.send({'year' : 2014});
        request.send({'course' : '42'});
        request.send({'modality' : 'AA'});
        request.expect(403);
        request.end(done);
      });
    });

    describe('without changeHistory permission', function () {
      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.post('/users/111111/histories');
        request.set('csrf-token', 'userToken');
        request.send({'year' : 2014});
        request.send({'period' : '1'});
        request.send({'course' : '42'});
        request.send({'modality' : 'AA'});
        request.expect(403);
        request.end(done);
      });
    });

    describe('without year', function () {
      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.post('/users/111111/histories');
        request.set('csrf-token', 'adminToken');
        request.send({'period' : '1'});
        request.send({'course' : '42'});
        request.expect(400);
        request.expect(function (response) {
          response.body.should.have.property('year').be.equal('required');
        });
        request.end(done);
      });
    });

    describe('without modality', function () {
      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.post('/users/111111/histories');
        request.set('csrf-token', 'adminToken');
        request.send({'year' : 2014});
        request.send({'course' : '42'});
        request.expect(400);
        request.expect(function (response) {
          response.body.should.have.property('modality').be.equal('required');
        });
        request.end(done);
      });
    });

    describe('without course', function () {
      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.post('/users/111111/histories');
        request.set('csrf-token', 'adminToken');
        request.send({'year' : 2014});
        request.send({'modality' : 'AA'});
        request.expect(400);
        request.expect(function (response) {
          response.body.should.have.property('course').be.equal('required');
        });
        request.end(done);
      });
    });

    describe('without year and modality', function () {
      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.post('/users/111111/histories');
        request.set('csrf-token', 'adminToken');
        request.send({'course' : '42'});
        request.expect(400);
        request.expect(function (response) {
          response.body.should.have.property('year').be.equal('required');
          response.body.should.have.property('modality').be.equal('required');
        });
        request.end(done);
      });
    });

    describe('without year and course', function () {
      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.post('/users/111111/histories');
        request.set('csrf-token', 'adminToken');
        request.send({'modality' : 'AA'});
        request.expect(400);
        request.expect(function (response) {
          response.body.should.have.property('year').be.equal('required');
          response.body.should.have.property('course').be.equal('required');
        });
        request.end(done);
      });
    });

    describe('without modality and course', function () {
      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.post('/users/111111/histories');
        request.set('csrf-token', 'adminToken');
        request.send({'year' : 2014});
        request.expect(400);
        request.expect(function (response) {
          response.body.should.have.property('modality').be.equal('required');
          response.body.should.have.property('course').be.equal('required');
        });
        request.end(done);
      });
    });

    describe('without year, modality and course', function () {
      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.post('/users/111111/histories');
        request.set('csrf-token', 'adminToken');
        request.expect(400);
        request.expect(function (response) {
          response.body.should.have.property('year').be.equal('required');
          response.body.should.have.property('modality').be.equal('required');
          response.body.should.have.property('course').be.equal('required');
        });
        request.end(done);
      });
    });

    describe('with valid credentials, year, modality and course', function () {
      it('should create', function (done) {
        var request;
        request = supertest(app);
        request = request.post('/users/111111/histories');
        request.set('csrf-token', 'adminToken');
        request.send({'year' : 2014});
        request.send({'course' : '42'});
        request.send({'modality' : 'AA'});
        request.expect(201);
        request.end(done);
      });
    });

    describe('with code taken', function () {
      before(History.remove.bind(History));

      before(function (done) {
        var request;
        request = supertest(app);
        request = request.post('/users/111111/histories');
        request.set('csrf-token', 'adminToken');
        request.send({'year' : 2014});
        request.send({'course' : '42'});
        request.send({'modality' : 'AA'});
        request.end(done);
      });

      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.post('/users/111111/histories');
        request.set('csrf-token', 'adminToken');
        request.send({'year' : 2014});
        request.send({'course' : '42'});
        request.send({'modality' : 'AA'});
        request.expect(409);
        request.end(done);
      });
    });
  });

  describe('list', function () {
    before(History.remove.bind(History));

    describe('with one in database', function () {
      before(function (done) {
        var request;
        request = supertest(app);
        request = request.post('/users/111111/histories');
        request.set('csrf-token', 'adminToken');
        request.send({'year' : 2014});
        request.send({'course' : '42'});
        request.send({'modality' : 'AA'});
        request.end(done);
      });

      it('should list 1 in first page', function (done) {
        var request;
        request = supertest(app);
        request = request.get('/users/111111/histories');
        request.expect(200);
        request.expect(function (response) {
          response.body.should.be.instanceOf(Array).with.lengthOf(1);
          response.body.every(function (history) {
            history.should.have.property('year');
            history.should.have.property('modality');
            history.should.have.property('course');
          });
        });
        request.end(done);
      });

      it('should return empty in second page', function (done) {
        var request;
        request = supertest(app);
        request = request.get('/users/111111/histories');
        request.send({'page' : 1});
        request.expect(200);
        request.expect(function (response) {
          response.body.should.be.instanceOf(Array).with.lengthOf(0);
        });
        request.end(done);
      });
    });
  });

  describe('details', function () {
    before(History.remove.bind(History));

    before(function (done) {
      var request;
      request = supertest(app);
      request = request.post('/users/111111/histories');
      request.set('csrf-token', 'adminToken');
      request.send({'year' : 2014});
      request.send({'course' : '42'});
      request.send({'modality' : 'AA'});
      request.end(done);
    });

    describe('without valid code', function () {
      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.get('/users/111111/histories/2012');
        request.expect(404);
        request.end(done);
      });
    });

    describe('with valid code', function () {
      it('should show', function (done) {
        var request;
        request = supertest(app);
        request = request.get('/users/111111/histories/2014');
        request.expect(200);
        request.expect(function (response) {
          response.body.should.have.property('year').be.equal(2014);
          response.body.should.have.property('modality').be.equal('AA');
          response.body.should.have.property('course').be.equal('42');
        });
        request.end(done);
      });
    });
  });

  describe('update', function () {
    before(History.remove.bind(History));

    before(function (done) {
      var request;
      request = supertest(app);
      request = request.post('/users/111111/histories');
      request.set('csrf-token', 'adminToken');
      request.send({'year' : 2014});
      request.send({'course' : '42'});
      request.send({'modality' : 'AA'});
      request.end(done);
    });

    describe('without token', function () {
      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.put('/users/111111/histories/2014');
        request.send({'year' : 2015});
        request.send({'course' : '43'});
        request.send({'modality' : 'AB'});
        request.expect(403);
        request.end(done);
      });
    });

    describe('without changeHistory permission', function () {
      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.put('/users/111111/histories/2014');
        request.set('csrf-token', 'userToken');
        request.send({'year' : 2015});
        request.send({'course' : '43'});
        request.send({'modality' : 'AB'});
        request.expect(403);
        request.end(done);
      });
    });

    describe('without valid code', function () {
      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.put('/users/111111/histories/2012');
        request.set('csrf-token', 'adminToken');
        request.send({'year' : 2015});
        request.send({'course' : '43'});
        request.send({'modality' : 'AB'});
        request.expect(404);
        request.end(done);
      });
    });

    describe('without year', function () {
      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.put('/users/111111/histories/2014');
        request.set('csrf-token', 'adminToken');
        request.send({'course' : '43'});
        request.send({'modality' : 'AB'});
        request.expect(400);
        request.expect(function (response) {
          response.body.should.have.property('year').be.equal('required');
        });
        request.end(done);
      });
    });

    describe('without modality', function () {
      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.put('/users/111111/histories/2014');
        request.set('csrf-token', 'adminToken');
        request.send({'year' : 2015});
        request.send({'course' : '43'});
        request.expect(400);
        request.expect(function (response) {
          response.body.should.have.property('modality').be.equal('required');
        });
        request.end(done);
      });
    });

    describe('without course', function () {
      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.put('/users/111111/histories/2014');
        request.set('csrf-token', 'adminToken');
        request.send({'year' : 2015});
        request.send({'modality' : 'AB'});
        request.expect(400);
        request.expect(function (response) {
          response.body.should.have.property('course').be.equal('required');
        });
        request.end(done);
      });
    });

    describe('without year and modality', function () {
      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.put('/users/111111/histories/2014');
        request.set('csrf-token', 'adminToken');
        request.send({'course' : '43'});
        request.expect(400);
        request.expect(function (response) {
          response.body.should.have.property('year').be.equal('required');
          response.body.should.have.property('modality').be.equal('required');
        });
        request.end(done);
      });
    });

    describe('without year and course', function () {
      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.put('/users/111111/histories/2014');
        request.set('csrf-token', 'adminToken');
        request.send({'modality' : 'AB'});
        request.expect(400);
        request.expect(function (response) {
          response.body.should.have.property('year').be.equal('required');
          response.body.should.have.property('course').be.equal('required');
        });
        request.end(done);
      });
    });

    describe('without modality and course', function () {
      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.put('/users/111111/histories/2014');
        request.set('csrf-token', 'adminToken');
        request.send({'year' : 2015});
        request.expect(400);
        request.expect(function (response) {
          response.body.should.have.property('modality').be.equal('required');
          response.body.should.have.property('course').be.equal('required');
        });
        request.end(done);
      });
    });

    describe('without year, modality and course', function () {
      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.put('/users/111111/histories/2014');
        request.set('csrf-token', 'adminToken');
        request.expect(400);
        request.expect(function (response) {
          response.body.should.have.property('year').be.equal('required');
          response.body.should.have.property('modality').be.equal('required');
          response.body.should.have.property('course').be.equal('required');
        });
        request.end(done);
      });
    });

    describe('with valid credentials, year, modality and course', function () {
      it('should update', function (done) {
        var request;
        request = supertest(app);
        request = request.put('/users/111111/histories/2014');
        request.set('csrf-token', 'adminToken');
        request.send({'year' : 2015});
        request.send({'course' : '43'});
        request.send({'modality' : 'AB'});
        request.expect(200);
        request.end(done);
      });

      after(function (done) {
        var request;
        request = supertest(app);
        request = request.get('/users/111111/histories/2014');
        request.expect(404);
        request.end(done);
      });

      after(function (done) {
        var request;
        request = supertest(app);
        request = request.get('/users/111111/histories/2015');
        request.expect(200);
        request.expect(function (response) {
          response.body.should.have.property('year').be.equal(2015);
          response.body.should.have.property('modality').be.equal('AB');
          response.body.should.have.property('course').be.equal('43');
        });
        request.end(done);
      });
    });

    describe('with code taken', function () {
      before(function (done) {
        var request;
        request = supertest(app);
        request = request.post('/users/111111/histories');
        request.set('csrf-token', 'adminToken');
        request.send({'year' : 2014});
        request.send({'course' : '42'});
        request.send({'modality' : 'AA'});
        request.end(done);
      });

      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.put('/users/111111/histories/2014');
        request.set('csrf-token', 'adminToken');
        request.send({'year' : 2015});
        request.send({'course' : '43'});
        request.send({'modality' : 'AB'});
        request.expect(409);
        request.end(done);
      });
    });
  });

  describe('delete', function () {
    before(History.remove.bind(History));

    before(function (done) {
      var request;
      request = supertest(app);
      request = request.post('/users/111111/histories');
      request.set('csrf-token', 'adminToken');
      request.send({'year' : 2014});
      request.send({'course' : '42'});
      request.send({'modality' : 'AA'});
      request.end(done);
    });

    describe('without token', function () {
      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.del('/users/111111/histories/2014');
        request.expect(403);
        request.end(done);
      });
    });

    describe('without changeHistory permission', function () {
      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.del('/users/111111/histories/2014');
        request.set('csrf-token', 'userToken');
        request.expect(403);
        request.end(done);
      });
    });

    describe('without valid code', function () {
      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.del('/users/111111/histories/2012');
        request.set('csrf-token', 'adminToken');
        request.expect(404);
        request.end(done);
      });
    });

    describe('with valid credentials and code', function () {
      it('should delete', function (done) {
        var request;
        request = supertest(app);
        request = request.del('/users/111111/histories/2014');
        request.set('csrf-token', 'adminToken');
        request.expect(204);
        request.end(done);
      });

      after(function (done) {
        var request;
        request = supertest(app);
        request = request.get('/users/111111/histories/2014');
        request.expect(404);
        request.end(done);
      });
    });
  });
});