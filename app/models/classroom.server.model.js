'use strict';

/**
* Module dependencies.
*/
var mongoose = require('mongoose'),
deepPopulate = require('mongoose-deep-populate'),
Schema = mongoose.Schema;

/**
* Classroom Schema
*/
var ClassroomSchema = new Schema({
  classname: String,
  teacher: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  sections: [
      { name: String,
        members: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}]
        }
    ],
  requests: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
});

ClassroomSchema.index({ teacher: 1 });
ClassroomSchema.plugin(deepPopulate);
//ExchangeSchema.set('autoIndex', (app.get('env') === 'development'));
mongoose.model('Classroom', ClassroomSchema);
