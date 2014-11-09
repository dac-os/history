var VError, router, nconf, slug, auth, History;

VError = require('verror');
router = require('express').Router();
nconf = require('nconf');
slug = require('slug');
auth = require('dacos-auth-driver');
History = require('../models/history');

/**
 * @api {post} /users/:user/histories Creates a new history.
 * @apiName createHistory
 * @apiVersion 1.0.0
 * @apiGroup history
 * @apiPermission changeHistory
 * @apiDescription
 * When creating a new history the user must send the history year, period, course, modality, conclusionLimit and
 * conclusionDate. The history code is used for identifying and must be unique in the system. If a existing code is sent
 * to this method, a 409 error will be raised. And if no year, or period, or course or modality is sent, a 400 error
 * will be raised.
 *
 * @apiParam {Number} year History year.
 * @apiParam {String} period History period.
 * @apiParam {String} course History course.
 * @apiParam {String} modality History modality.
 * @apiParam {Date} [conclusionLimit] History conclusionLimit.
 * @apiParam {Date} [conclusionDate] History conclusionDate.
 *
 * @apiErrorExample
 * HTTP/1.1 400 Bad Request
 * {
 *   "year": "required",
 *   "period": "required",
 *   "course": "required",
 *   "modality": "required"
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
.route('/users/:user/histories')
.post(auth.can('changeHistory'))
.post(function createHistory(request, response, next) {
  'use strict';

  var history;
  history = new History({
    'user'            : request.params.user,
    'course'          : request.param('course'),
    'modality'        : request.param('modality'),
    'year'            : request.param('year'),
    'period'          : request.param('period'),
    'conclusionLimit' : request.param('conclusionLimit'),
    'conclusionDate'  : request.param('conclusionDate')
  });
  return history.save(function createdHistory(error) {
    if (error) {
      error = new VError(error, 'error creating history');
      return next(error);
    }
    return response.status(201).end();
  });
});

/**
 * @api {get} /users/:user/histories List all system histories.
 * @apiName listHistory
 * @apiVersion 1.0.0
 * @apiGroup history
 * @apiPermission none
 * @apiDescription
 * This method returns an array with all histories in the database. The data is returned in pages of length 20. If no
 * page is passed, the system will assume the requested page is page 0, otherwise the desired page must be sent.
 *
 * @apiParam {[Number=0]} page Requested page.
 *
 * @apiSuccess (history) {Number} year History year.
 * @apiSuccess (history) {String} period History period.
 * @apiSuccess (history) {String} course History course.
 * @apiSuccess (history) {String} modality History modality.
 * @apiSuccess (history) {Date} [conclusionLimit] History conclusionLimit.
 * @apiSuccess (history) {Date} [conclusionDate] History conclusionDate.
 * @apiSuccess (history) {Date} createdAt History creation date.
 * @apiSuccess (history) {Date} updatedAt History last update date.
 *
 * @apiSuccessExample
 * HTTP/1.1 200 OK
 * [{
 *   "year": 2012,
 *   "period": "1",
 *   "course": "42",
 *   "modality": "AA",
 *   "conclusionLimit": "2017-07-01T12:22:25.058Z",
 *   "efficiencyCoefficient": 0.98,
 *   "createdAt": "2014-07-01T12:22:25.058Z",
 *   "updatedAt": "2014-07-01T12:22:25.058Z"
 * }]
 */
router
.route('/users/:user/histories')
.get(function listHistory(request, response, next) {
  'use strict';

  var pageSize, page, query;
  pageSize = nconf.get('PAGE_SIZE');
  page = request.param('page', 0) * pageSize;
  query = History.find();
  query.where('user').equals(request.params.user);
  query.skip(page);
  query.limit(pageSize);
  return query.exec(function listedHistory(error, histories) {
    if (error) {
      error = new VError(error, 'error finding histories');
      return next(error);
    }
    return response.status(200).send(histories);
  });
});

/**
 * @api {get} /users/:user/histories/:history Get history information.
 * @apiName getHistory
 * @apiVersion 1.0.0
 * @apiGroup history
 * @apiPermission none
 * @apiDescription
 * This method returns a single history details, the history code must be passed in the uri to identify the requested
 * history. If no history with the requested code was found, a 404 error will be raised.
 *
 * @apiSuccess {Number} year History year.
 * @apiSuccess {String} period History period.
 * @apiSuccess {String} course History course.
 * @apiSuccess {String} modality History modality.
 * @apiSuccess {Date} [conclusionLimit] History conclusionLimit.
 * @apiSuccess {Date} [conclusionDate] History conclusionDate.
 * @apiSuccess {Date} createdAt History creation date.
 * @apiSuccess {Date} updatedAt History last update date.
 *
 * @apiErrorExample
 * HTTP/1.1 404 Not Found
 * {}
 *
 * @apiSuccessExample
 * HTTP/1.1 200 OK
 * {
 *   "year": 2012,
 *   "period": "1",
 *   "course": "42",
 *   "modality": "AA",
 *   "conclusionLimit": "2017-07-01T12:22:25.058Z",
 *   "efficiencyCoefficient": 0.98,
 *   "createdAt": "2014-07-01T12:22:25.058Z",
 *   "updatedAt": "2014-07-01T12:22:25.058Z"
 * }
 */
router
.route('/users/:user/histories/:history')
.get(function getHistory(request, response) {
  'use strict';

  var history;
  history = request.history;
  return response.status(200).send(history);
});

/**
 * @api {put} /users/:user/histories/:history Updates history information.
 * @apiName updateHistory
 * @apiVersion 1.0.0
 * @apiGroup history
 * @apiPermission changeHistory
 * @apiDescription
 * When updating a history the user must send the history year, period, course, modality, conclusionLimit and
 * conclusionDate. If a existing code which is not the original history code is sent to this method, a 409 error will be
 * raised. And if no year, or period, or course or modality is sent, a 400 error will be raised. If no history with the
 * requested code was found, a 404 error will be raised.
 *
 * @apiParam {Number} year History year.
 * @apiParam {String} period History period.
 * @apiParam {String} course History course.
 * @apiParam {String} modality History modality.
 * @apiParam {Date} [conclusionLimit] History conclusionLimit.
 * @apiParam {Date} [conclusionDate] History conclusionDate.
 *
 * @apiErrorExample
 * HTTP/1.1 404 Not Found
 * {}
 *
 * @apiErrorExample
 * HTTP/1.1 400 Bad Request
 * {
 *   "year": "required",
 *   "period": "required",
 *   "course": "required",
 *   "modality": "required"
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
.route('/users/:user/histories/:history')
.put(auth.can('changeHistory'))
.put(function updateHistory(request, response, next) {
  'use strict';

  var history;
  history = request.history;
  history.course = request.param('course');
  history.modality = request.param('modality');
  history.year = request.param('year');
  history.period = request.param('period');
  history.conclusionLimit = request.param('conclusionLimit');
  history.conclusionDate = request.param('conclusionDate');
  return history.save(function updatedHistory(error) {
    if (error) {
      error = new VError(error, 'error updating history: ""', request.params.history);
      return next(error);
    }
    return response.status(200).end();
  });
});

/**
 * @api {delete} /users/:user/histories/:history Removes history.
 * @apiName removeHistory
 * @apiVersion 1.0.0
 * @apiGroup history
 * @apiPermission changeHistory
 * @apiDescription
 * This method removes a history from the system. If no history with the requested code was found, a 404 error will be
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
.route('/users/:user/histories/:history')
.delete(auth.can('changeHistory'))
.delete(function removeHistory(request, response, next) {
  'use strict';

  var history;
  history = request.history;
  return history.remove(function removedHistory(error) {
    if (error) {
      error = new VError(error, 'error removing history: ""', request.params.history);
      return next(error);
    }
    return response.status(204).end();
  });
});

router.param('history', function findHistory(request, response, next, id) {
  'use strict';

  var query;
  query = History.findOne();
  query.where('user').equals(request.params.user);
  query.where('year').equals(isNaN(id) ? 0 : id);
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

module.exports = router;