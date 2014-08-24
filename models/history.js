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
  'period'          : {
    'type'     : String,
    'required' : true
  },
  'course'          : {
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
  'user'   : 1,
  'year'   : 1,
  'period' : 1
}, {
  'unique' : true
});

schema.plugin(jsonSelect, {
  '_id'             : 0,
  'user'            : 0,
  'year'            : 1,
  'period'          : 1,
  'course'          : 1,
  'conclusionLimit' : 1,
  'conclusionDate'  : 1,
  'createdAt'       : 1,
  'updatedAt'       : 1
});

schema.pre('save', function setHistoryUpdatedAt(next) {
  'use strict';

  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('History', schema);