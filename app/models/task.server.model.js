'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Task Schema
 */
var TaskSchema = new Schema({
	ind: Number,
	name: String,
	type: String,
	img1: String,
	img2: String,
	thumb: String,
	sktch_driv: String,
	scktch_inst: String,
	seen_by: []
});

TaskSchema.index({ ind: 1 });
//ExchangeSchema.set('autoIndex', (app.get('env') === 'development'));
mongoose.model('Task', TaskSchema);
