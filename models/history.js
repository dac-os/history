var VError, mongoose, jsonSelect, nconf, Schema, schema;

VError = require('verror');
mongoose = require('mongoose');
jsonSelect = require('mongoose-json-select');
nconf = require('nconf');
Schema = mongoose.Schema;

schema = new Schema({
  'user'            : {
    'type'     : String,
    'required' : true
  },
  'year'            : {
    'type'     : Number,
    'required' : true
  },
  'course'          : {
    'type'     : String,
    'required' : true
  },
  'modality'        : {
    'type'     : String,
    'required' : true
  },
  'conclusionLimit' : {
    'type' : Date
  },
  'conclusionDate'  : {
    'type' : Date
  },
  'createdAt'       : {
    'type'    : Date,
    'default' : Date.now
  },
  'updatedAt'       : {
    'type' : Date
  }
}, {
  'collection' : 'histories',
  'strict'     : true,
  'toJSON'     : {
    'virtuals' : true
  }
});

schema.index({
  'user' : 1,
  'year' : 1
}, {
  'unique' : true
});

schema.plugin(jsonSelect, {
  '_id'                   : 0,
  'user'                  : 0,
  'year'                  : 1,
  'course'                : 1,
  'modality'              : 1,
  'conclusionLimit'       : 1,
  'conclusionDate'        : 1,
  'efficiencyCoefficient' : 1,
  'createdAt'             : 1,
  'updatedAt'             : 1
});

schema.pre('save', function setHistoryUpdatedAt(next) {
  'use strict';

  this.updatedAt = new Date();
  next();
});

schema.pre('init', function (next, data) {
  'use strict';

  var Discipline, query;
  Discipline = require('./discipline');
  query = Discipline.find();
  query.where('history').equals(data._id);
  query.exec(function (error, disciplines) {
    if (error) {
      error = new VError(error, 'error finding history: "%s" disciplines', data._id);
      return next(error);
    }
    this.disciplines = disciplines;
    return next();
  }.bind(this));
});

schema.virtual('finishedDisciplines').get(function historyFinishedDisciplines() {
  return this.disciplines.filter(function filterHistoryFinishedDisciplines(discipline) {
    return [4, 5, 6].indexOf(discipline.status) > -1;
  });
});

schema.virtual('efficiencyCoefficient').get(function () {
  'use strict';

  var gradeSum, creditSum;

  gradeSum = this.finishedDisciplines.map(function (discipline) {
    return discipline.grade * discipline.credits;
  }).reduce(function (gradeSum, grade) {
    return gradeSum + grade;
  }, 0);

  creditSum = this.finishedDisciplines.map(function (discipline) {
    return discipline.credits;
  }).reduce(function (creditSum, credit) {
    return creditSum + credit;
  }, 0) * 10;

  return creditSum ? gradeSum / creditSum : 1;
});

module.exports = mongoose.model('History', schema);