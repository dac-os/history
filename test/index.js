/*globals describe, before, it, after*/
require('should');
var supertest, app;

supertest = require('supertest');
nock = require('nock');
nconf = require('nconf');
app = require('../index.js');

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

nock(nconf.get('COURSES_URI')).get('/catalogs/2015/modalities/43-AB').times(Infinity).reply(200, {
  'code'   : 'AB',
  'course' : {
    'code'  : '43',
    'name'  : 'Ciencia da computação 2',
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

it('should raise server', function (done) {
  'use strict';

  var request;
  request = supertest(app);
  request = request.get('/');
  request.expect(200);
  request.end(done);
});