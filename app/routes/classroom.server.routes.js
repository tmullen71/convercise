'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users.server.controller');
	var classroom = require('../../app/controllers/classroom.server.controller');

	// Classrooms Routes

	app.route('/classroom')
		.get(classroom.list)
		.post(users.requiresLogin, classroom.create);
/*
	app.route('/classroom/:classroomId')
		.get(classroom.list)
		.post(users.requiresLogin, classroom.create);

	app.route('/classroom/:classroomId/:studentId')
		.get(classroom.read)
		.put(users.requiresLogin, classroom.hasAuthorization, classroom.update)
		.delete(users.requiresLogin, classroom.hasAuthorization, classroom.delete);
*/
	// Finish by binding the Exchange middleware
	app.param('studentId', classroom.studentById);
	app.param('classroomId', classroom.classroomById);

};
