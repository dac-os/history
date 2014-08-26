var VError, mongoose, jsonSelect, nconf, Schema, schema;

VError = require('verror');
mongoose = require('mongoose');
jsonSelect = require('mongoose-json-select');
nconf = require('nconf');
Schema = mongoose.Schema;

schema = new Schema({
  'history'    : {
    'type'     : Schema.ObjectId,
    'ref'      : 'History',
    'required' : true
  },
  'discipline' : {
    'type'     : String,
    'required' : true
  },
  'offering'   : {
    'type'     : String,
    'required' : true
  },
  'credits'    : {
    'type'     : Number
  },
  'grade'      : {
    'type' : String
  },
  'frequency'  : {
    'type' : Number
  },
  'status'     : {
    'type' : Number
  },
  'createdAt'  : {
    'type'    : Date,
    'default' : Date.now
  },
  'updatedAt'  : {
    'type' : Date
  }
}, {
  'collection' : 'disciplines',
  'strict'     : true,
  'toJSON'     : {
    'virtuals' : true
  }
});

schema.index({
  'history'    : 1,
  'discipline' : 1,
  'offering'   : 1
}, {
  'unique' : true
});

schema.plugin(jsonSelect, {
  '_id'        : 0,
  'history'    : 1,
  'discipline' : 1,
  'offering'   : 1,
  'credits'    : 1,
  'grade'      : 1,
  'frequency'  : 1,
  'status'     : 1,
  'createdAt'  : 1,
  'updatedAt'  : 1
});

schema.pre('save', function setDisciplineUpdatedAt(next) {
  'use strict';

  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Discipline', schema);