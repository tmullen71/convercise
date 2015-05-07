'use strict';

/**
 * Module dependencies.
 */

var activeUsers = require('../../lib/active-users');

exports.index = function(req, res) {
	activeUsers.setBusy(req.user, false);
	res.render('index', {
		user: req.user || null,
		request: req
	});
};
