/*globals describe, before, beforeEach, it, after*/
require('should');
var supertest, nock, nconf, app, Discipline, History;

supertest = require('supertest');
app = require('../index.js');
nock = require('nock');
nconf = require('nconf');
Discipline = require('../models/discipline');
History = require('../models/history');

nock(nconf.get('AUTH_URI'), {
  'reqheaders' : {'csrf-token' : 'adminToken'}
}).get('/users/me').times(Infinity).reply(200, {
  'academicRegistry' : '111111',
  'profile'          : {
    'name'        : 'admin',
    'slug'        : 'admin',
    'permissions' : ['changeHistory', 'changeDiscipline']
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

nock(nconf.get('COURSES_URI')).get('/catalogs/2014/modalities/42-AA').times(Infinity).reply(200, {
  'code'   : 'AA',
  'course' : {
    'code'  : '42',
    'name'  : 'Ciencia da computação',
    'level' : 'GRAD'
  }
});

nock(nconf.get('COURSES_URI')).get('/disciplines/undefined').times(Infinity).reply(404, {});

nock(nconf.get('COURSES_URI')).get('/disciplines/MC102').times(Infinity).reply(200, {
  'code'        : 'MC102',
  'name'        : 'Programação de computadores',
  'credits'     : 6,
  'department'  : 'IC',
  'description' : 'Programação de computadores'
});

nock(nconf.get('COURSES_URI')).get('/disciplines/MC202').times(Infinity).reply(200, {
  'code'        : 'MC202',
  'name'        : 'Estrutura de dados',
  'credits'     : 6,
  'department'  : 'IC',
  'description' : 'Estrutura de dados'
});

nock(nconf.get('COURSES_URI')).get('/disciplines/MC302').times(Infinity).reply(200, {
  'code'        : 'MC302',
  'name'        : 'Programação orientada a objetos',
  'credits'     : 6,
  'department'  : 'IC',
  'description' : 'Programação orientada a objetos'
});

nock(nconf.get('COURSES_URI')).get('/disciplines/MC940').times(Infinity).reply(200, {
  'code'        : 'MC940',
  'name'        : 'Computação Gráfica',
  'credits'     : 4,
  'department'  : 'IC',
  'description' : 'Computação Gráfica'
});

nock(nconf.get('COURSES_URI')).get('/disciplines/MC001').times(Infinity).reply(200, {
  'code'        : 'MC001',
  'name'        : 'Introdução à computação',
  'credits'     : 2,
  'department'  : 'IC',
  'description' : 'Introdução à computação'
});

nock(nconf.get('COURSES_URI')).get('/disciplines/MC102/offerings/undefined').times(Infinity).reply(404, {});

nock(nconf.get('COURSES_URI')).get('/disciplines/MC202/offerings/undefined').times(Infinity).reply(404, {});

nock(nconf.get('COURSES_URI')).get('/disciplines/MC102/offerings/2014-1-A').times(Infinity).reply(200, {
  'code'   : 'A',
  'year'   : 2014,
  'period' : '1'
});

nock(nconf.get('COURSES_URI')).get('/disciplines/MC202/offerings/2014-1-A').times(Infinity).reply(200, {
  'code'   : 'A',
  'year'   : 2014,
  'period' : '1'
});

nock(nconf.get('COURSES_URI')).get('/disciplines/MC302/offerings/2014-1-A').times(Infinity).reply(200, {
  'code'   : 'A',
  'year'   : 2014,
  'period' : '1'
});

nock(nconf.get('COURSES_URI')).get('/disciplines/MC940/offerings/2014-1-A').times(Infinity).reply(200, {
  'code'   : 'A',
  'year'   : 2014,
  'period' : '1'
});

nock(nconf.get('COURSES_URI')).get('/disciplines/MC001/offerings/2014-1-A').times(Infinity).reply(200, {
  'code'   : 'A',
  'year'   : 2014,
  'period' : '1'
});

nock(nconf.get('COURSES_URI')).get('/catalogs/2014/modalities/42-AA/blocks?page=0').times(Infinity).reply(200, [
  {
    'code'    : 'visao',
    'type'    : 'eletorias',
    'credits' : 4
  },
  {
    'code' : 'nucleo-comum',
    'type' : 'obrigatorias'
  },
  {
    'code'    : 'eletivas',
    'type'    : 'eletivas',
    'credits' : 14
  }
]);

nock(nconf.get('COURSES_URI')).get('/catalogs/2014/modalities/42-AA/blocks?page=1').times(Infinity).reply(200, []);

nock(nconf.get('COURSES_URI')).get('/catalogs/2014/modalities/42-AA/blocks/visao/requirements?page=0').times(Infinity).reply(200, [
  {
    'discipline' : {
      'code'       : 'MC930',
      'name'       : 'Visão Computacional',
      'credits'    : 4,
      'department' : 'IC'
    }
  },
  {
    'discipline' : {
      'code'       : 'MC940',
      'name'       : 'Computação Gráfica',
      'credits'    : 4,
      'department' : 'IC'
    }
  }
]);

nock(nconf.get('COURSES_URI')).get('/catalogs/2014/modalities/42-AA/blocks/visao/requirements?page=1').times(Infinity).reply(200, []);

nock(nconf.get('COURSES_URI')).get('/catalogs/2014/modalities/42-AA/blocks/nucleo-comum/requirements?page=0').times(Infinity).reply(200, [
  {
    'discipline' : {
      'code'       : 'MC102',
      'name'       : 'Programação de computadores',
      'credits'    : 6,
      'department' : 'IC'
    }
  },
  {
    'discipline' : {
      'code'       : 'MC202',
      'name'       : 'Estrutura de dados',
      'credits'    : 6,
      'department' : 'IC'
    }
  }
]);

nock(nconf.get('COURSES_URI')).get('/catalogs/2014/modalities/42-AA/blocks/nucleo-comum/requirements?page=1').times(Infinity).reply(200, []);

nock(nconf.get('COURSES_URI')).get('/catalogs/2014/modalities/42-AA/blocks/eletivas/requirements?page=0').times(Infinity).reply(200, [
  {
    'mask' : 'MC---'
  }
]);

nock(nconf.get('COURSES_URI')).get('/catalogs/2014/modalities/42-AA/blocks/eletivas/requirements?page=1').times(Infinity).reply(200, []);

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

    it('should raise error without token', function (done) {
      var request;
      request = supertest(app);
      request = request.post('/users/111111/histories/2014/disciplines');
      request.send({'discipline' : 'MC102'});
      request.send({'offering' : '2014-1-A'});
      request.expect(403);
      request.end(done);
    });

    it('should raise error without changeDiscipline permission', function (done) {
      var request;
      request = supertest(app);
      request = request.post('/users/111111/histories/2014/disciplines');
      request.set('csrf-token', 'userToken');
      request.send({'discipline' : 'MC102'});
      request.send({'offering' : '2014-1-A'});
      request.expect(403);
      request.end(done);
    });

    it('should raise error with invalid history code', function (done) {
      var request;
      request = supertest(app);
      request = request.post('/users/111111/histories/2012/disciplines');
      request.set('csrf-token', 'adminToken');
      request.send({'discipline' : 'MC102'});
      request.send({'offering' : '2014-1-A'});
      request.expect(404);
      request.end(done);
    });

    it('should raise error without discipline', function (done) {
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

    it('should raise error without offering', function (done) {
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

    it('should raise error without discipline and offering', function (done) {
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

    before(function (done) {
      var request;
      request = supertest(app);
      request = request.post('/users/111111/histories/2014/disciplines');
      request.set('csrf-token', 'adminToken');
      request.send({'discipline' : 'MC102'});
      request.send({'offering' : '2014-1-A'});
      request.end(done);
    });

    it('should raise error with invalid history code', function (done) {
      var request;
      request = supertest(app);
      request = request.get('/users/111111/histories/2012/disciplines');
      request.expect(404);
      request.end(done);
    });

    it('should list', function (done) {
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

    it('should raise error with invalid history code', function (done) {
      var request;
      request = supertest(app);
      request = request.get('/users/111111/histories/2012/disciplines/MC102-2014-1-A');
      request.expect(404);
      request.end(done);
    });

    it('should raise error with invalid code', function (done) {
      var request;
      request = supertest(app);
      request = request.get('/users/111111/histories/2014/disciplines/invalid');
      request.expect(404);
      request.end(done);
    });

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

    it('should raise error without token', function (done) {
      var request;
      request = supertest(app);
      request = request.put('/users/111111/histories/2014/disciplines/MC102-2014-1-A');
      request.send({'discipline' : 'MC202'});
      request.send({'offering' : '2014-1-A'});
      request.expect(403);
      request.end(done);
    });

    it('should raise error without changeDiscipline permission', function (done) {
      var request;
      request = supertest(app);
      request = request.put('/users/111111/histories/2014/disciplines/MC102-2014-1-A');
      request.set('csrf-token', 'userToken');
      request.send({'discipline' : 'MC202'});
      request.send({'offering' : '2014-1-A'});
      request.expect(403);
      request.end(done);
    });

    it('should raise error with invalid history code', function (done) {
      var request;
      request = supertest(app);
      request = request.put('/users/111111/histories/2012/disciplines/MC102-2014-1-A');
      request.set('csrf-token', 'adminToken');
      request.send({'discipline' : 'MC202'});
      request.send({'offering' : '2014-1-A'});
      request.expect(404);
      request.end(done);
    });

    it('should raise error with invalid code', function (done) {
      var request;
      request = supertest(app);
      request = request.put('/users/111111/histories/2014/disciplines/invalid');
      request.set('csrf-token', 'adminToken');
      request.send({'discipline' : 'MC202'});
      request.send({'offering' : '2014-1-A'});
      request.expect(404);
      request.end(done);
    });

    it('should raise error without offering', function (done) {
      var request;
      request = supertest(app);
      request = request.put('/users/111111/histories/2014/disciplines/MC102-2014-1-A');
      request.set('csrf-token', 'adminToken');
      request.send({'discipline' : 'MC202'});
      request.expect(400);
      request.expect(function (response) {
        response.body.should.have.property('offering').be.equal('required');
      });
      request.end(done);
    });

    it('should raise error without discipline', function (done) {
      var request;
      request = supertest(app);
      request = request.put('/users/111111/histories/2014/disciplines/MC102-2014-1-A');
      request.set('csrf-token', 'adminToken');
      request.send({'offering' : '2014-1-A'});
      request.expect(400);
      request.expect(function (response) {
        response.body.should.have.property('discipline').be.equal('required');
      });
      request.end(done);
    });

    it('should raise error without discipline and offering', function (done) {
      var request;
      request = supertest(app);
      request = request.put('/users/111111/histories/2014/disciplines/MC102-2014-1-A');
      request.set('csrf-token', 'adminToken');
      request.expect(400);
      request.expect(function (response) {
        response.body.should.have.property('discipline').be.equal('required');
        response.body.should.have.property('offering').be.equal('required');
      });
      request.end(done);
    });

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

    it('should raise error without token', function (done) {
      var request;
      request = supertest(app);
      request = request.del('/users/111111/histories/2014/disciplines/MC102-2014-1-A');
      request.expect(403);
      request.end(done);
    });

    it('should raise error without changeDiscipline permission', function (done) {
      var request;
      request = supertest(app);
      request = request.del('/users/111111/histories/2014/disciplines/MC102-2014-1-A');
      request.set('csrf-token', 'userToken');
      request.expect(403);
      request.end(done);
    });

    it('should raise error with invalid history code', function (done) {
      var request;
      request = supertest(app);
      request = request.del('/users/111111/histories/2012/disciplines/MC102-2014-1-A');
      request.set('csrf-token', 'adminToken');
      request.expect(404);
      request.end(done);
    });

    it('should raise error with invalid code', function (done) {
      var request;
      request = supertest(app);
      request = request.del('/users/111111/histories/2014/disciplines/invalid');
      request.set('csrf-token', 'adminToken');
      request.expect(404);
      request.end(done);
    });

    it('should delete', function (done) {
      var request;
      request = supertest(app);
      request = request.del('/users/111111/histories/2014/disciplines/MC102-2014-1-A');
      request.set('csrf-token', 'adminToken');
      request.expect(204);
      request.end(done);
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