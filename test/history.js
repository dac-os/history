/*globals describe, before, beforeEach, it, after*/
require('should');
var supertest, nock, nconf, app, History;

supertest = require('supertest');
app = require('../index.js');
nock = require('nock');
nconf = require('nconf');
History = require('../models/history');

nock(nconf.get('AUTH_URI'), {
  'reqheaders' : {'csrf-token' : 'adminToken'}
}).get('/users/me').times(Infinity).reply(200, {
  'academicRegistry' : '111111',
  'profile'          : {
    'name'        : 'admin',
    'slug'        : 'admin',
    'permissions' : ['changeHistory']
  }
});

nock(nconf.get('AUTH_URI'), {
  'reqheaders' : {'csrf-token' : 'userToken'}
}).get('/users/me').times(Infinity).reply(200, {
  'academicRegistry' : '111112',
  'profile'          : {
    'name'        : 'user',
    'slug'        : 'user',
    'permissions' : []
  }
});

nock(nconf.get('AUTH_URI'), {
  'reqheaders' : {'csrf-token' : 'undefined'}
}).get('/users/me').times(Infinity).reply(404, {});

nock(nconf.get('COURSES_URI')).get('/courses/undefined').times(Infinity).reply(404, {});

nock(nconf.get('COURSES_URI')).get('/courses/42').times(Infinity).reply(200, {
  'code'  : '42',
  'name'  : 'Ciencia da computação',
  'level' : 'GRAD'
});

nock(nconf.get('COURSES_URI')).get('/courses/43').times(Infinity).reply(200, {
  'code'  : '43',
  'name'  : 'Ciencia da computação 2',
  'level' : 'GRAD'
});

describe('history controller', function () {
  'use strict';

  describe('create', function () {
    before(History.remove.bind(History));

    it('should raise error without token', function (done) {
      var request;
      request = supertest(app);
      request = request.post('/users/111111/histories');
      request.send({'year' : 2014});
      request.send({'period' : '1'});
      request.send({'course' : '42'});
      request.expect(403);
      request.end(done);
    });

    it('should raise error without changeHistory permission', function (done) {
      var request;
      request = supertest(app);
      request = request.post('/users/111111/histories');
      request.set('csrf-token', 'userToken');
      request.send({'year' : 2014});
      request.send({'period' : '1'});
      request.send({'course' : '42'});
      request.expect(403);
      request.end(done);
    });

    it('should raise error without year', function (done) {
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

    it('should raise error without period', function (done) {
      var request;
      request = supertest(app);
      request = request.post('/users/111111/histories');
      request.set('csrf-token', 'adminToken');
      request.send({'year' : 2014});
      request.send({'course' : '42'});
      request.expect(400);
      request.expect(function (response) {
        response.body.should.have.property('period').be.equal('required');
      });
      request.end(done);
    });

    it('should raise error without course', function (done) {
      var request;
      request = supertest(app);
      request = request.post('/users/111111/histories');
      request.set('csrf-token', 'adminToken');
      request.send({'year' : 2014});
      request.send({'period' : '1'});
      request.expect(400);
      request.expect(function (response) {
        response.body.should.have.property('course').be.equal('required');
      });
      request.end(done);
    });

    it('should raise error without year and period', function (done) {
      var request;
      request = supertest(app);
      request = request.post('/users/111111/histories');
      request.set('csrf-token', 'adminToken');
      request.send({'course' : '42'});
      request.expect(400);
      request.expect(function (response) {
        response.body.should.have.property('year').be.equal('required');
        response.body.should.have.property('period').be.equal('required');
      });
      request.end(done);
    });

    it('should raise error without year and course', function (done) {
      var request;
      request = supertest(app);
      request = request.post('/users/111111/histories');
      request.set('csrf-token', 'adminToken');
      request.send({'period' : '1'});
      request.expect(400);
      request.expect(function (response) {
        response.body.should.have.property('year').be.equal('required');
        response.body.should.have.property('course').be.equal('required');
      });
      request.end(done);
    });

    it('should raise error without period and course', function (done) {
      var request;
      request = supertest(app);
      request = request.post('/users/111111/histories');
      request.set('csrf-token', 'adminToken');
      request.send({'year' : 2014});
      request.expect(400);
      request.expect(function (response) {
        response.body.should.have.property('period').be.equal('required');
        response.body.should.have.property('course').be.equal('required');
      });
      request.end(done);
    });

    it('should raise error without year, period and course', function (done) {
      var request;
      request = supertest(app);
      request = request.post('/users/111111/histories');
      request.set('csrf-token', 'adminToken');
      request.expect(400);
      request.expect(function (response) {
        response.body.should.have.property('year').be.equal('required');
        response.body.should.have.property('period').be.equal('required');
        response.body.should.have.property('course').be.equal('required');
      });
      request.end(done);
    });

    it('should create', function (done) {
      var request;
      request = supertest(app);
      request = request.post('/users/111111/histories');
      request.set('csrf-token', 'adminToken');
      request.send({'year' : 2014});
      request.send({'period' : '1'});
      request.send({'course' : '42'});
      request.expect(201);
      request.end(done);
    });

    describe('with code taken', function () {
      before(History.remove.bind(History));

      before(function (done) {
        var request;
        request = supertest(app);
        request = request.post('/users/111111/histories');
        request.set('csrf-token', 'adminToken');
        request.send({'year' : 2014});
        request.send({'period' : '1'});
        request.send({'course' : '42'});
        request.end(done);
      });

      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.post('/users/111111/histories');
        request.set('csrf-token', 'adminToken');
        request.send({'year' : 2014});
        request.send({'period' : '1'});
        request.send({'course' : '42'});
        request.expect(409);
        request.end(done);
      });
    });
  });

  describe('list', function () {
    before(History.remove.bind(History));

    before(function (done) {
      var request;
      request = supertest(app);
      request = request.post('/users/111111/histories');
      request.set('csrf-token', 'adminToken');
      request.send({'year' : 2014});
      request.send({'period' : '1'});
      request.send({'course' : '42'});
      request.end(done);
    });

    it('should list', function (done) {
      var request;
      request = supertest(app);
      request = request.get('/users/111111/histories');
      request.expect(200);
      request.expect(function (response) {
        response.body.should.be.instanceOf(Array).with.lengthOf(1);
        response.body.every(function (history) {
          history.should.have.property('year');
          history.should.have.property('period');
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

  describe('details', function () {
    before(History.remove.bind(History));

    before(function (done) {
      var request;
      request = supertest(app);
      request = request.post('/users/111111/histories');
      request.set('csrf-token', 'adminToken');
      request.send({'year' : 2014});
      request.send({'period' : '1'});
      request.send({'course' : '42'});
      request.end(done);
    });

    it('should raise error with invalid code', function (done) {
      var request;
      request = supertest(app);
      request = request.get('/users/111111/histories/2014-invalid');
      request.expect(404);
      request.end(done);
    });

    it('should show', function (done) {
      var request;
      request = supertest(app);
      request = request.get('/users/111111/histories/2014-1');
      request.expect(200);
      request.expect(function (response) {
        response.body.should.have.property('year').be.equal(2014);
        response.body.should.have.property('period').be.equal('1');
        response.body.should.have.property('course').be.equal('42');
      });
      request.end(done);
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
      request.send({'period' : '1'});
      request.send({'course' : '42'});
      request.end(done);
    });

    it('should raise error without token', function (done) {
      var request;
      request = supertest(app);
      request = request.put('/users/111111/histories/2014-1');
      request.send({'year' : 2015});
      request.send({'period' : '2'});
      request.send({'course' : '43'});
      request.expect(403);
      request.end(done);
    });

    it('should raise error without changeHistory permission', function (done) {
      var request;
      request = supertest(app);
      request = request.put('/users/111111/histories/2014-1');
      request.set('csrf-token', 'userToken');
      request.send({'year' : 2015});
      request.send({'period' : '2'});
      request.send({'course' : '43'});
      request.expect(403);
      request.end(done);
    });

    it('should raise error with invalid code', function (done) {
      var request;
      request = supertest(app);
      request = request.put('/users/111111/histories/2014-invalid');
      request.set('csrf-token', 'adminToken');
      request.send({'year' : 2015});
      request.send({'period' : '2'});
      request.send({'course' : '43'});
      request.expect(404);
      request.end(done);
    });

    it('should raise error without year', function (done) {
      var request;
      request = supertest(app);
      request = request.put('/users/111111/histories/2014-1');
      request.set('csrf-token', 'adminToken');
      request.send({'period' : '2'});
      request.send({'course' : '43'});
      request.expect(400);
      request.expect(function (response) {
        response.body.should.have.property('year').be.equal('required');
      });
      request.end(done);
    });

    it('should raise error without period', function (done) {
      var request;
      request = supertest(app);
      request = request.put('/users/111111/histories/2014-1');
      request.set('csrf-token', 'adminToken');
      request.send({'year' : 2015});
      request.send({'course' : '43'});
      request.expect(400);
      request.expect(function (response) {
        response.body.should.have.property('period').be.equal('required');
      });
      request.end(done);
    });

    it('should raise error without course', function (done) {
      var request;
      request = supertest(app);
      request = request.put('/users/111111/histories/2014-1');
      request.set('csrf-token', 'adminToken');
      request.send({'year' : 2015});
      request.send({'period' : '2'});
      request.expect(400);
      request.expect(function (response) {
        response.body.should.have.property('course').be.equal('required');
      });
      request.end(done);
    });

    it('should raise error without year and period', function (done) {
      var request;
      request = supertest(app);
      request = request.put('/users/111111/histories/2014-1');
      request.set('csrf-token', 'adminToken');
      request.send({'course' : '43'});
      request.expect(400);
      request.expect(function (response) {
        response.body.should.have.property('year').be.equal('required');
        response.body.should.have.property('period').be.equal('required');
      });
      request.end(done);
    });

    it('should raise error without year and course', function (done) {
      var request;
      request = supertest(app);
      request = request.put('/users/111111/histories/2014-1');
      request.set('csrf-token', 'adminToken');
      request.send({'period' : '2'});
      request.expect(400);
      request.expect(function (response) {
        response.body.should.have.property('year').be.equal('required');
        response.body.should.have.property('course').be.equal('required');
      });
      request.end(done);
    });

    it('should raise error without period and course', function (done) {
      var request;
      request = supertest(app);
      request = request.put('/users/111111/histories/2014-1');
      request.set('csrf-token', 'adminToken');
      request.send({'year' : 2015});
      request.expect(400);
      request.expect(function (response) {
        response.body.should.have.property('period').be.equal('required');
        response.body.should.have.property('course').be.equal('required');
      });
      request.end(done);
    });

    it('should raise error without year, period and course', function (done) {
      var request;
      request = supertest(app);
      request = request.put('/users/111111/histories/2014-1');
      request.set('csrf-token', 'adminToken');
      request.expect(400);
      request.expect(function (response) {
        response.body.should.have.property('year').be.equal('required');
        response.body.should.have.property('period').be.equal('required');
        response.body.should.have.property('course').be.equal('required');
      });
      request.end(done);
    });

    it('should update', function (done) {
      var request;
      request = supertest(app);
      request = request.put('/users/111111/histories/2014-1');
      request.set('csrf-token', 'adminToken');
      request.send({'year' : 2015});
      request.send({'period' : '2'});
      request.send({'course' : '43'});
      request.expect(200);
      request.end(done);
    });

    describe('with code taken', function () {
      before(function (done) {
        var request;
        request = supertest(app);
        request = request.post('/users/111111/histories');
        request.set('csrf-token', 'adminToken');
        request.send({'year' : 2014});
        request.send({'period' : '1'});
        request.send({'course' : '42'});
        request.end(done);
      });

      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.put('/users/111111/histories/2014-1');
        request.set('csrf-token', 'adminToken');
        request.send({'year' : 2015});
        request.send({'period' : '2'});
        request.send({'course' : '43'});
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
      request.send({'period' : '1'});
      request.send({'course' : '42'});
      request.end(done);
    });

    it('should raise error without token', function (done) {
      var request;
      request = supertest(app);
      request = request.del('/users/111111/histories/2014-1');
      request.expect(403);
      request.end(done);
    });

    it('should raise error without changeHistory permission', function (done) {
      var request;
      request = supertest(app);
      request = request.del('/users/111111/histories/2014-1');
      request.set('csrf-token', 'userToken');
      request.expect(403);
      request.end(done);
    });

    it('should raise error with invalid code', function (done) {
      var request;
      request = supertest(app);
      request = request.del('/users/111111/histories/2014-invalid');
      request.set('csrf-token', 'adminToken');
      request.expect(404);
      request.end(done);
    });

    it('should delete', function (done) {
      var request;
      request = supertest(app);
      request = request.del('/users/111111/histories/2014-1');
      request.set('csrf-token', 'adminToken');
      request.expect(204);
      request.end(done);
    });
  });
});