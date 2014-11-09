/*globals describe, before, beforeEach, it, after*/
require('should');
var supertest, app, Discipline, History;

supertest = require('supertest');
app = require('../index.js');
Discipline = require('../models/discipline');
History = require('../models/history');

describe('discipline controller', function () {
  'use strict';

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

  describe('create', function () {
    before(Discipline.remove.bind(Discipline));

    describe('without token', function () {
      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.post('/users/111111/histories/2014/disciplines');
        request.send({'discipline' : 'MC102'});
        request.send({'offering' : '2014-1-A'});
        request.expect(403);
        request.end(done);
      });
    });

    describe('without changeDiscipline permission', function () {
      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.post('/users/111111/histories/2014/disciplines');
        request.set('csrf-token', 'userToken');
        request.send({'discipline' : 'MC102'});
        request.send({'offering' : '2014-1-A'});
        request.expect(403);
        request.end(done);
      });
    });

    describe('without valid history code', function () {
      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.post('/users/111111/histories/2012/disciplines');
        request.set('csrf-token', 'adminToken');
        request.send({'discipline' : 'MC102'});
        request.send({'offering' : '2014-1-A'});
        request.expect(404);
        request.end(done);
      });
    });

    describe('without discipline', function () {
      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.post('/users/111111/histories/2014/disciplines');
        request.set('csrf-token', 'adminToken');
        request.send({'offering' : '2014-1-A'});
        request.expect(400);
        request.expect(function (response) {
          response.body.should.have.property('discipline').be.equal('required');
        });
        request.end(done);
      });
    });

    describe('without offering', function () {
      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.post('/users/111111/histories/2014/disciplines');
        request.set('csrf-token', 'adminToken');
        request.send({'discipline' : 'MC102'});
        request.expect(400);
        request.expect(function (response) {
          response.body.should.have.property('offering').be.equal('required');
        });
        request.end(done);
      });
    });

    describe('without discipline and offering', function () {
      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.post('/users/111111/histories/2014/disciplines');
        request.set('csrf-token', 'adminToken');
        request.expect(400);
        request.expect(function (response) {
          response.body.should.have.property('discipline').be.equal('required');
          response.body.should.have.property('offering').be.equal('required');
        });
        request.end(done);
      });
    });

    describe('with valid credentials, discipline and offering', function () {
      it('should create', function (done) {
        var request;
        request = supertest(app);
        request = request.post('/users/111111/histories/2014/disciplines');
        request.set('csrf-token', 'adminToken');
        request.send({'discipline' : 'MC102'});
        request.send({'offering' : '2014-1-A'});
        request.expect(201);
        request.end(done);
      });
    });

    describe('with code taken', function () {
      before(Discipline.remove.bind(Discipline));

      before(function (done) {
        var request;
        request = supertest(app);
        request = request.post('/users/111111/histories/2014/disciplines');
        request.set('csrf-token', 'adminToken');
        request.send({'discipline' : 'MC102'});
        request.send({'offering' : '2014-1-A'});
        request.end(done);
      });

      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.post('/users/111111/histories/2014/disciplines');
        request.set('csrf-token', 'adminToken');
        request.send({'discipline' : 'MC102'});
        request.send({'offering' : '2014-1-A'});
        request.expect(409);
        request.end(done);
      });
    });
  });

  describe('list', function () {
    before(Discipline.remove.bind(Discipline));

    describe('without valid history code', function () {
      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.get('/users/111111/histories/2012/disciplines');
        request.expect(404);
        request.end(done);
      });
    });

    describe('with one in database', function () {
      before(function (done) {
        var request;
        request = supertest(app);
        request = request.post('/users/111111/histories/2014/disciplines');
        request.set('csrf-token', 'adminToken');
        request.send({'discipline' : 'MC102'});
        request.send({'offering' : '2014-1-A'});
        request.end(done);
      });

      it('should list 1 in first page', function (done) {
        var request;
        request = supertest(app);
        request = request.get('/users/111111/histories/2014/disciplines');
        request.expect(200);
        request.expect(function (response) {
          response.body.should.be.instanceOf(Array).with.lengthOf(1);
          response.body.every(function (discipline) {
            discipline.should.have.property('discipline');
            discipline.should.have.property('offering');
          });
        });
        request.end(done);
      });

      it('should return empty in second page', function (done) {
        var request;
        request = supertest(app);
        request = request.get('/users/111111/histories/2014/disciplines');
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
    before(Discipline.remove.bind(Discipline));

    before(function (done) {
      var request;
      request = supertest(app);
      request = request.post('/users/111111/histories/2014/disciplines');
      request.set('csrf-token', 'adminToken');
      request.send({'discipline' : 'MC102'});
      request.send({'offering' : '2014-1-A'});
      request.end(done);
    });

    describe('without valid history code', function () {
      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.get('/users/111111/histories/2012/disciplines/MC102-2014-1-A');
        request.expect(404);
        request.end(done);
      });
    });

    describe('without valid code', function () {
      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.get('/users/111111/histories/2014/disciplines/invalid');
        request.expect(404);
        request.end(done);
      });
    });

    describe('with valid code', function () {
      it('should show', function (done) {
        var request;
        request = supertest(app);
        request = request.get('/users/111111/histories/2014/disciplines/MC102-2014-1-A');
        request.expect(200);
        request.expect(function (response) {
          response.body.should.have.property('discipline').be.equal('MC102');
          response.body.should.have.property('offering').be.equal('2014-1-A');
        });
        request.end(done);
      });
    });
  });

  describe('update', function () {
    before(Discipline.remove.bind(Discipline));

    before(function (done) {
      var request;
      request = supertest(app);
      request = request.post('/users/111111/histories/2014/disciplines');
      request.set('csrf-token', 'adminToken');
      request.send({'discipline' : 'MC102'});
      request.send({'offering' : '2014-1-A'});
      request.end(done);
    });

    describe('without token', function () {
      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.put('/users/111111/histories/2014/disciplines/MC102-2014-1-A');
        request.send({'discipline' : 'MC202'});
        request.send({'offering' : '2014-1-A'});
        request.expect(403);
        request.end(done);
      });
    });

    describe('without changeDiscipline permission', function () {
      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.put('/users/111111/histories/2014/disciplines/MC102-2014-1-A');
        request.set('csrf-token', 'userToken');
        request.send({'discipline' : 'MC202'});
        request.send({'offering' : '2014-1-A'});
        request.expect(403);
        request.end(done);
      });
    });

    describe('without valid history code', function () {
      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.put('/users/111111/histories/2012/disciplines/MC102-2014-1-A');
        request.set('csrf-token', 'adminToken');
        request.send({'discipline' : 'MC202'});
        request.send({'offering' : '2014-1-A'});
        request.expect(404);
        request.end(done);
      });
    });

    describe('without valid code', function () {
      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.put('/users/111111/histories/2014/disciplines/invalid');
        request.set('csrf-token', 'adminToken');
        request.send({'discipline' : 'MC202'});
        request.send({'offering' : '2014-1-A'});
        request.expect(404);
        request.end(done);
      });
    });

    describe('without discipline', function () {
      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.put('/users/111111/histories/2014/disciplines/MC102-2014-1-A');
        request.set('csrf-token', 'adminToken');
        request.send({'offering' : '2014-1-A'});
        request.expect(400);
        request.end(done);
      });
    });

    describe('without offering', function () {
      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.put('/users/111111/histories/2014/disciplines/MC102-2014-1-A');
        request.set('csrf-token', 'adminToken');
        request.send({'discipline' : 'MC202'});
        request.expect(400);
        request.end(done);
      });
    });

    describe('without discipline and offering', function () {
      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.put('/users/111111/histories/2014/disciplines/MC102-2014-1-A');
        request.set('csrf-token', 'adminToken');
        request.expect(400);
        request.end(done);
      });
    });

    describe('with valid credentials, discipline and offering', function () {
      it('should update', function (done) {
        var request;
        request = supertest(app);
        request = request.put('/users/111111/histories/2014/disciplines/MC102-2014-1-A');
        request.set('csrf-token', 'adminToken');
        request.send({'discipline' : 'MC202'});
        request.send({'offering' : '2014-1-A'});
        request.expect(200);
        request.end(done);
      });

      after(function (done) {
        var request;
        request = supertest(app);
        request = request.get('/users/111111/histories/2014/disciplines/MC102-2014-1-A');
        request.expect(404);
        request.end(done);
      });

      after(function (done) {
        var request;
        request = supertest(app);
        request = request.get('/users/111111/histories/2014/disciplines/MC202-2014-1-A');
        request.expect(200);
        request.expect(function (response) {
          response.body.should.have.property('discipline').be.equal('MC202');
          response.body.should.have.property('offering').be.equal('2014-1-A');
        });
        request.end(done);
      });
    });

    describe('with code taken', function () {
      before(function (done) {
        var request;
        request = supertest(app);
        request = request.post('/users/111111/histories/2014/disciplines');
        request.set('csrf-token', 'adminToken');
        request.send({'discipline' : 'MC102'});
        request.send({'offering' : '2014-1-A'});
        request.end(done);
      });

      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.put('/users/111111/histories/2014/disciplines/MC102-2014-1-A');
        request.set('csrf-token', 'adminToken');
        request.send({'discipline' : 'MC202'});
        request.send({'offering' : '2014-1-A'});
        request.expect(409);
        request.end(done);
      });
    });
  });

  describe('delete', function () {
    before(Discipline.remove.bind(Discipline));

    before(function (done) {
      var request;
      request = supertest(app);
      request = request.post('/users/111111/histories/2014/disciplines');
      request.set('csrf-token', 'adminToken');
      request.send({'discipline' : 'MC102'});
      request.send({'offering' : '2014-1-A'});
      request.end(done);
    });

    describe('without token', function () {
      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.del('/users/111111/histories/2014/disciplines/MC102-2014-1-A');
        request.expect(403);
        request.end(done);
      });
    });

    describe('without changeDiscipline permission', function () {
      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.del('/users/111111/histories/2014/disciplines/MC102-2014-1-A');
        request.set('csrf-token', 'userToken');
        request.expect(403);
        request.end(done);
      });
    });

    describe('without valid history code', function () {
      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.del('/users/111111/histories/2012/disciplines/MC102-2014-1-A');
        request.set('csrf-token', 'adminToken');
        request.expect(404);
        request.end(done);
      });
    });

    describe('without valid code', function () {
      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.del('/users/111111/histories/2014/disciplines/invalid');
        request.set('csrf-token', 'adminToken');
        request.expect(404);
        request.end(done);
      });
    });

    describe('with valid credentials and code', function () {
      it('should delete', function (done) {
        var request;
        request = supertest(app);
        request = request.del('/users/111111/histories/2014/disciplines/MC102-2014-1-A');
        request.set('csrf-token', 'adminToken');
        request.expect(204);
        request.end(done);
      });

      after(function (done) {
        var request;
        request = supertest(app);
        request = request.get('/users/111111/histories/2014/disciplines/MC102-2014-1-A');
        request.expect(404);
        request.end(done);
      });
    });
  });

  describe('efficiency coefficient and course progress', function () {
    before(Discipline.remove.bind(Discipline));

    before(function (done) {
      var request;
      request = supertest(app);
      request = request.post('/users/111111/histories/2014/disciplines');
      request.set('csrf-token', 'adminToken');
      request.send({'discipline' : 'MC102'});
      request.send({'offering' : '2014-1-A'});
      request.send({'grade' : 'A'});
      request.send({'credits' : 6});
      request.send({'status' : 5});
      request.end(done);
    });

    before(function (done) {
      var request;
      request = supertest(app);
      request = request.post('/users/111111/histories/2014/disciplines');
      request.set('csrf-token', 'adminToken');
      request.send({'discipline' : 'MC202'});
      request.send({'offering' : '2014-1-A'});
      request.send({'grade' : 'B'});
      request.send({'credits' : 6});
      request.send({'status' : 5});
      request.end(done);
    });

    before(function (done) {
      var request;
      request = supertest(app);
      request = request.post('/users/111111/histories/2014/disciplines');
      request.set('csrf-token', 'adminToken');
      request.send({'discipline' : 'MC302'});
      request.send({'offering' : '2014-1-A'});
      request.send({'grade' : 'C'});
      request.send({'credits' : 6});
      request.send({'status' : 5});
      request.end(done);
    });

    before(function (done) {
      var request;
      request = supertest(app);
      request = request.post('/users/111111/histories/2014/disciplines');
      request.set('csrf-token', 'adminToken');
      request.send({'discipline' : 'MC940'});
      request.send({'offering' : '2014-1-A'});
      request.send({'grade' : 'D'});
      request.send({'credits' : 6});
      request.send({'status' : 5});
      request.end(done);
    });

    before(function (done) {
      var request;
      request = supertest(app);
      request = request.post('/users/111111/histories/2014/disciplines');
      request.set('csrf-token', 'adminToken');
      request.send({'discipline' : 'MC001'});
      request.send({'offering' : '2014-1-A'});
      request.send({'grade' : '0.5'});
      request.send({'credits' : 6});
      request.send({'status' : 5});
      request.end(done);
    });

    it('should calculate', function (done) {
      var request;
      request = supertest(app);
      request = request.get('/users/111111/histories/2014');
      request.expect(200);
      request.expect(function (response) {
        response.body.should.have.property('efficiencyCoefficient').be.approximately(0.57, 0.01);
        response.body.should.have.property('courseProgress').be.approximately(0.93, 0.01);
      });
      request.end(done);
    });
  });
});