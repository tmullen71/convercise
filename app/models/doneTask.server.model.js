'use strict';

/**
* Module dependencies.
*/
var mongoose = require('mongoose'),
deepPopulate = require('mongoose-deep-populate'),
Schema = mongoose.Schema;

/**
* DoneTask Schema
*/
var DoneTaskSchema = new Schema({
  exchange: {type: mongoose.Schema.Types.ObjectId, ref: 'Exchange'},
  nativeSpeaker: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  learner: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  beginTime: {type: Date},
  endTime: {type:Date},
  duration: Number,
  language: String,
  answer: String,
  task: {type: mongoose.Schema.Types.ObjectId, ref: 'Task'},
  completed: {type: Boolean}
});

DoneTaskSchema.index({ nativeSpeaker: 1 });
DoneTaskSchema.index({ learner: 1 });
DoneTaskSchema.index({ language: 1 });

DoneTaskSchema.plugin(deepPopulate);
//ExchangeSchema.set('autoIndex', (app.get('env') === 'development'));
mongoose.model('DoneTask', DoneTaskSchema);
