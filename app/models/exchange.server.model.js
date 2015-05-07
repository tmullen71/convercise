'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	deepPopulate = require('mongoose-deep-populate'),
	Schema = mongoose.Schema;

/**
 * Exchange Schema
 */
var ExchangeSchema = new Schema({
	state: String,
	first_socket: String,
	inviter: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
	invitee: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
	created: {type: Date},
	doneTasks: [{type: mongoose.Schema.Types.ObjectId, ref: 'DoneTask'},
							{type: mongoose.Schema.Types.ObjectId, ref: 'DoneTask'}],
});

ExchangeSchema.index({ state: 1 });
ExchangeSchema.index({ inviter: 1 });
ExchangeSchema.index({ invitee: 1 });

ExchangeSchema.plugin(deepPopulate);
//ExchangeSchema.set('autoIndex', (app.get('env') === 'development'));
mongoose.model('Exchange', ExchangeSchema);
