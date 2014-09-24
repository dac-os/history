var VError, mongoose, jsonSelect, nconf, async, courses, lpsolve, Schema, schema;

VError = require('verror');
mongoose = require('mongoose');
jsonSelect = require('mongoose-json-select');
nconf = require('nconf');
async = require('async');
courses = require('dacos-courses-driver');
lpsolve = require('lp_solve');
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
  'courseProgress'        : 1,
  'createdAt'             : 1,
  'updatedAt'             : 1
});

schema.pre('save', function setHistoryUpdatedAt(next) {
  'use strict';

  this.updatedAt = new Date();
  next();
});

schema.pre('init', function setHistoryDisciplines(next, data) {
  'use strict';

  var Discipline, query;
  Discipline = require('./discipline');
  query = Discipline.find();
  query.where('history').equals(data._id);
  query.exec(function (error, disciplines) {
    if (error) {
      error = new VError(error, 'error finding history disciplines');
      return next(error);
    }
    this.disciplines = disciplines;
    return next();
  }.bind(this));
});

schema.pre('init', function setHistoryBlocks(next, data) {
  'use strict';

  function optimize(block, courses) {
    var lp, credits, x, objective, limit, res, Row;
    Row = lpsolve.Row;
    lp = new lpsolve.LinearProgram();
    credits = [];
    x = courses.map(function (course, index) {
      credits[index] = course.credits;
      return lp.addColumn('x' + index, false, true);
    });
    objective = new Row();
    x.forEach(function (variable, index) {
      objective.Add(variable, credits[index]);
    });
    lp.setObjective(objective);
    limit = new Row();
    x.forEach(function (variable, index) {
      limit.Add(variable, credits[index]);
    });
    lp.addConstraint(limit, 'GE', block.credits, 'Satisfaz o bloco');
    lp.solve();
    res = [];
    x.forEach(function (xi, index) {
      if (lp.get(xi) == 1) {
        res.push(courses[index]);
      }
    });
    return res;
  }

  var coursedDisciplines;

  coursedDisciplines = (this.disciplines || []).filter(function (coursedDiscipline) {
    return [5, 6, 8, 9, 21].indexOf(coursedDiscipline.status) !== -1;
  });

  async.waterfall([function (next) {
    courses.blocks(data.year, data.course + '-' + data.modality, next);
  }, function (blocks, next) {
    async.map(blocks, function (block, next) {
      courses.requirements(data.year, data.course + '-' + data.modality, block.code, function (error, requirements) {
        block.requirements = requirements;
        return next(error, block);
      });
    }, next);
  }], function (error, blocks) {
    this.blocks = blocks.map(function (block) {
      var blockDisciplines;

      blockDisciplines = coursedDisciplines.filter(function (coursedDiscipline) {
        return block.requirements.some(function (requiredDiscipline) {
          if (!requiredDiscipline.mask) return requiredDiscipline.discipline.code === coursedDiscipline.discipline;
          return coursedDiscipline.discipline.match(new RegExp(requiredDiscipline.mask.replace(/-/g, '[A-Z0-9]')));
        });
      });

      block.creditsDone = blockDisciplines.reduce(function (creditsDone, candidate) {
        return creditsDone + candidate.credits;
      }, 0);

      if (block.creditsDone > block.credits) blockDisciplines = optimize(block, blockDisciplines);

      coursedDisciplines = coursedDisciplines.filter(function (coursedDiscipline) {
        return blockDisciplines.indexOf(coursedDiscipline) === -1;
      });

      block.creditsDone = blockDisciplines.reduce(function (creditsDone, candidate) {
        return creditsDone + candidate.credits;
      }, 0);
      return block;
    });
    next();
  }.bind(this));
});

schema.virtual('finishedDisciplines').get(function historyFinishedDisciplines() {
  'use strict';

  return this.disciplines.filter(function filterHistoryFinishedDisciplines(discipline) {
    return [4, 5, 6].indexOf(discipline.status) > -1;
  });
});

schema.virtual('efficiencyCoefficient').get(function historyEfficiencyCoefficient() {
  'use strict';

  var gradeSum, creditSum;

  gradeSum = this.finishedDisciplines.map(function (discipline) {
    return discipline.score * discipline.credits;
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

schema.virtual('courseProgress').get(function historyCourseProgress() {
  'use strict';

  var creditsDone, totalCredits, blocks;

  blocks = this.blocks || [];

  creditsDone = blocks.map(function (block) {
    return (block.creditsDone > block.credits ? block.credits : block.creditsDone) || 0;
  }).reduce(function (creditsDone, credits) {
    return creditsDone + credits;
  }, 0);

  totalCredits = blocks.map(function (block) {
    return block.credits ? block.credits : block.requirements.map(function (requirement) {
      return requirement.discipline ? requirement.discipline.credits : 0;
    }).reduce(function (totalCredits, credits) {
      return totalCredits + credits;
    }, 0);
  }).reduce(function (totalCredits, credits) {
    return totalCredits + credits;
  }, 0) || 1;

  return creditsDone / totalCredits;
});

schema.path('modality').validate(function validateIfCourseModalityExists(value, next) {
  'use strict';

  return courses.modality(this.year, this.course + '-' + this.modality, function foundCourseModality(error, modality) {
    next(!error && !!modality);
  }.bind(this));
}, 'course modality not found');

module.exports = mongoose.model('History', schema);