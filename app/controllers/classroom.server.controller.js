'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	Classroom = mongoose.model('Classroom'),
	_ = require('lodash');

console.log('Running server controller.');

 /* Create a classroom
*/

exports.create = function(req, res) {

};


/**
 * Update
 */

exports.update = function(req, res) {
	var classrm = req.classroom ;

	classrm = _.extend(classrm , req.body);

	classrm.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(classrm);
		}
	});
};

/**
 * Delete
*/

exports.delete = function(req, res) {
	var exch = req.exchange ;

	exch.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(exch);
		}
	});
};


/**
 * List Classroom
 */
exports.list = function(req, res) {
	Classroom.where({teacher: req.user.id}).findOne()
	.sort('-created').limit(10)
	.deepPopulate('sections.members requests')
	.exec(function(err, classroom) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
				console.log('Getting classroom');
				console.log(classroom);
				res.jsonp(classroom);
		}
	});
};

/**
 * Exchange middleware
 */

exports.studentById = function(req, res, next, id) {

};

exports.classroomById = function(req, res, next, id) {

};

/**
 * Exchange authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
//	if (req.exchange.user.id !== req.user.id) {
/*
	if (req.exchange.inviter.toString() !== req.user.id) {
		return res.status(403).send('Only inviter logs the exchange');
	}
	next();
	*/
//	if (req.exchange.inviter.toString() === req.user.id) {
		next();
//	}
};
