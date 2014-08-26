var VError, router, nconf, slug, auth, courses, Discipline, History;

VError = require('verror');
router = require('express').Router();
nconf = require('nconf');
slug = require('slug');
auth = require('dacos-auth-driver');
courses = require('dacos-courses-driver');
Discipline = require('../models/discipline');
History = require('../models/history');

router.use(function (request, response, next) {
  'use strict';

  var disciplineId;
  disciplineId = request.param('discipline');
  if (!disciplineId) {
    return next();
  }
  return courses.discipline(disciplineId, function (error, discipline) {
    if (error) {
      error = new VError(error, 'Error finding discipline: "$s"', disciplineId);
      return next(error);
    }
    request.coursedDiscipline = discipline;
    return next();
  }.bind(this));
});

router.use(function (request, response, next) {
  'use strict';

  var offeringId, disciplineId;
  offeringId = request.param('offering');
  disciplineId = request.param('discipline');
  if (!offeringId || !disciplineId) {
    return next();
  }
  return courses.offering(disciplineId, offeringId, function (error, offering) {
    if (error) {
      error = new VError(error, 'Error finding offering: "$s"', offeringId);
      return next(error);
    }
    request.offering = offering;
    return next();
  }.bind(this));
});

/**
 * @api {post} /users/:user/histories/:history/disciplines Creates a new discipline.
 * @apiName createDiscipline
 * @apiVersion 1.0.0
 * @apiGroup discipline
 * @apiPermission changeDiscipline
 * @apiDescription
 * When creating a new discipline history the user must send the discipline, offering, grade, frequency and
 * status. The discipline code is used for identifying and must be unique in the system. If a existing code is sent to
 * this method, a 409 error will be raised. And if no discipline or offering is sent, a 400 error will be raised.
 *
 * @apiParam {String} discipline Discipline code.
 * @apiParam {String} offering Discipline offering.
 * @apiParam {Number} credits Discipline credits.
 * @apiParam {String} grade Discipline grade.
 * @apiParam {Number} frequency Discipline frequency.
 * @apiParam {Number} status Discipline status.
 *
 * @apiErrorExample
 * HTTP/1.1 400 Bad Request
 * {
 *   "discipline": "required",
 *   "offering": "required"
 * }
 *
 * @apiErrorExample
 * HTTP/1.1 403 Forbidden
 * {}
 *
 * @apiErrorExample
 * HTTP/1.1 409 Conflict
 * {}
 *
 * @apiSuccessExample
 * HTTP/1.1 201 Created
 * {}
 */
router
.route('/users/:user/histories/:history/disciplines')
.post(auth.can('changeDiscipline'))
.post(function createDiscipline(request, response, next) {
  'use strict';

  var discipline;
  discipline = new Discipline({
    'history'    : request.history,
    'discipline' : request.coursedDiscipline ? request.coursedDiscipline.code : null,
    'offering'   : request.offering ? request.offering.year + '-' + request.offering.period + '-' + request.offering.code : null,
    'grade'      : request.param('grade'),
    'frequency'  : request.param('frequency'),
    'status'     : request.param('status')
  });
  return discipline.save(function createdDiscipline(error) {
    if (error) {
      error = new VError(error, 'error creating discipline');
      return next(error);
    }
    return response.status(201).end();
  });
});

/**
 * @api {get} /users/:user/histories/:history/disciplines List all system disciplines.
 * @apiName listDiscipline
 * @apiVersion 1.0.0
 * @apiGroup discipline
 * @apiPermission none
 * @apiDescription
 * This method returns an array with all disciplines in the database. The data is returned in pages of length 20. If no
 * page is passed, the system will assume the requested page is page 0, otherwise the desired page must be sent.
 *
 * @apiParam {[Number=0]} page Requested page.
 *
 * @apiSuccess (discipline) {String} discipline Discipline code.
 * @apiSuccess (discipline) {String} offering Discipline offering.
 * @apiSuccess (discipline) {Number} credits Discipline credits.
 * @apiSuccess (discipline) {String} grade Discipline grade.
 * @apiSuccess (discipline) {Number} frequency Discipline frequency.
 * @apiSuccess (discipline) {Number} status Discipline status.
 * @apiSuccess (discipline) {Date} createdAt Discipline creation date.
 * @apiSuccess (discipline) {Date} updatedAt Discipline last update date.
 *
 * @apiSuccessExample
 * HTTP/1.1 200 OK
 * [{
 *   "discipline": "MC102",
 *   "offering": "2014-1-A",
 *   "credits": 6,
 *   "grade": "10",
 *   "frequency": 100,
 *   "status": 5,
 *   "createdAt": "2014-07-01T12:22:25.058Z",
 *   "updatedAt": "2014-07-01T12:22:25.058Z"
 * }]
 */
router
.route('/users/:user/histories/:history/disciplines')
.get(function listDiscipline(request, response, next) {
  'use strict';

  var pageSize, page, query;
  pageSize = nconf.get('PAGE_SIZE');
  page = request.param('page', 0) * pageSize;
  query = Discipline.find();
  query.where('history').equals(request.history._id);
  query.skip(page);
  query.limit(pageSize);
  return query.exec(function listedDiscipline(error, disciplines) {
    if (error) {
      error = new VError(error, 'error finding disciplines');
      return next(error);
    }
    return response.status(200).send(disciplines);
  });
});

/**
 * @api {get} /users/:user/histories/:history/disciplines/:discipline Get discipline information.
 * @apiName getDiscipline
 * @apiVersion 1.0.0
 * @apiGroup discipline
 * @apiPermission none
 * @apiDescription
 * This method returns a single discipline details, the discipline code must be passed in the uri to identify the requested
 * discipline. If no discipline with the requested code was found, a 404 error will be raised.
 *
 * @apiSuccess {String} discipline Discipline code.
 * @apiSuccess {String} offering Discipline offering.
 * @apiSuccess {Number} credits Discipline credits.
 * @apiSuccess {String} grade Discipline grade.
 * @apiSuccess {Number} frequency Discipline frequency.
 * @apiSuccess {Number} status Discipline status.
 * @apiSuccess {Date} createdAt Discipline creation date.
 * @apiSuccess {Date} updatedAt Discipline last update date.
 *
 * @apiErrorExample
 * HTTP/1.1 404 Not Found
 * {}
 *
 * @apiSuccessExample
 * HTTP/1.1 200 OK
 * {
 *   "discipline": "MC102",
 *   "offering": "2014-1-A",
 *   "credits": 6,
 *   "grade": "10",
 *   "frequency": 100,
 *   "status": 5,
 *   "createdAt": "2014-07-01T12:22:25.058Z",
 *   "updatedAt": "2014-07-01T12:22:25.058Z"
 * }
 */
router
.route('/users/:user/histories/:history/disciplines/:discipline')
.get(function getDiscipline(request, response) {
  'use strict';

  var discipline;
  discipline = request.discipline;
  return response.status(200).send(discipline);
});

/**
 * @api {put} /users/:user/histories/:history/disciplines/:discipline Updates discipline information.
 * @apiName updateDiscipline
 * @apiVersion 1.0.0
 * @apiGroup discipline
 * @apiPermission changeDiscipline
 * @apiDescription
 * When updating a discipline the user must send the discipline, offering, grade, frequency and status. If a existing
 * code which is not the original discipline code is sent to this method, a 409 error will be raised. And if no
 * discipline or offering is sent, a 400 error will be raised. If no discipline with the requested code was found, a 404
 * error will be raised.
 *
 * @apiParam {String} discipline Discipline code.
 * @apiParam {String} offering Discipline offering.
 * @apiParam {Number} credits Discipline credits.
 * @apiParam {String} grade Discipline grade.
 * @apiParam {Number} frequency Discipline frequency.
 * @apiParam {Number} status Discipline status.
 *
 * @apiErrorExample
 * HTTP/1.1 404 Not Found
 * {}
 *
 * @apiErrorExample
 * HTTP/1.1 400 Bad Request
 * {
 *   "discipline": "required",
 *   "offering": "required"
 * }
 *
 * @apiErrorExample
 * HTTP/1.1 403 Forbidden
 * {}
 *
 * @apiErrorExample
 * HTTP/1.1 409 Conflict
 * {}
 *
 * @apiSuccessExample
 * HTTP/1.1 200 Ok
 * {}
 */
router
.route('/users/:user/histories/:history/disciplines/:discipline')
.put(auth.can('changeDiscipline'))
.put(function updateDiscipline(request, response, next) {
  'use strict';

  var discipline;
  discipline = request.discipline;
  discipline.discipline = request.coursedDiscipline ? request.coursedDiscipline.code : null;
  discipline.offering = request.offering ? request.offering.year + '-' + request.offering.period + '-' + request.offering.code : null;
  discipline.grade = request.param('grade');
  discipline.frequency = request.param('frequency');
  discipline.status = request.param('status');
  return discipline.save(function updatedDiscipline(error) {
    if (error) {
      error = new VError(error, 'error updating discipline: ""', request.params.discipline);
      return next(error);
    }
    return response.status(200).end();
  });
});

/**
 * @api {delete} /users/:user/histories/:history/disciplines/:discipline Removes discipline.
 * @apiName removeDiscipline
 * @apiVersion 1.0.0
 * @apiGroup discipline
 * @apiPermission changeDiscipline
 * @apiDescription
 * This method removes a discipline from the system. If no discipline with the requested code was found, a 404 error will be
 * raised.
 *
 * @apiErrorExample
 * HTTP/1.1 404 Not Found
 * {}
 *
 * @apiErrorExample
 * HTTP/1.1 403 Forbidden
 * {}
 *
 * @apiSuccessExample
 * HTTP/1.1 204 No Content
 * {}
 */
router
.route('/users/:user/histories/:history/disciplines/:discipline')
.delete(auth.can('changeDiscipline'))
.delete(function removeDiscipline(request, response, next) {
  'use strict';

  var discipline;
  discipline = request.discipline;
  return discipline.remove(function removedDiscipline(error) {
    if (error) {
      error = new VError(error, 'error removing discipline: ""', request.params.discipline);
      return next(error);
    }
    return response.status(204).end();
  });
});

router.param('history', function findHistory(request, response, next, id) {
  'use strict';

  var query, code;
  code = id.split('-');
  query = History.findOne();
  query.where('user').equals(request.params.user);
  query.where('year').equals(code[0]);
  query.where('period').equals(code[1]);
  query.exec(function foundHistory(error, history) {
    if (error) {
      error = new VError(error, 'error finding history: ""', history);
      return next(error);
    }
    if (!history) {
      return response.status(404).end();
    }
    request.history = history;
    return next();
  });
});

router.param('discipline', function findDiscipline(request, response, next, id) {
  'use strict';

  var query, code;
  code = id.split('-');
  query = Discipline.findOne();
  query.where('discipline').equals(code[0]);
  query.where('offering').equals(code[1] + '-' + code[2] + '-' + code[3]);
  query.where('history').equals(request.history._id);
  query.exec(function foundDiscipline(error, discipline) {
    if (error) {
      error = new VError(error, 'error finding discipline: ""', discipline);
      return next(error);
    }
    if (!discipline) {
      return response.status(404).end();
    }
    request.discipline = discipline;
    return next();
  });
});

module.exports = router;