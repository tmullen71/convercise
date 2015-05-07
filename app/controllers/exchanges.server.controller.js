'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	activeUsers = require('../../lib/active-users'),
	Exchange = mongoose.model('Exchange'),
	DoneTask = mongoose.model('DoneTask'),
	moment = require('moment'),
	async = require('async'),
	_ = require('lodash');

var workflow;
var exchange;

var driver;

exports.init = function(req, res){
		workflow = req.app.utility.workflow(req, res);

		//workflow.on('createExchange', function(server, socket, target) {
		workflow.on('createExchange', function(server, socket, langs) {
			//console.log('createExchange should be called once');
			//var now = moment();

			exchange = new Exchange();
			exchange.state = 'init';
			exchange.created = moment();
			exchange.doneTasks = [];
			var dt0 = new DoneTask({'exchange': exchange, 'completed': false});
			var dt1 = new DoneTask({'exchange': exchange, 'completed': false});
			exchange.doneTasks[0] = dt0._id;
			exchange.doneTasks[1] = dt1._id;

			var doneTaskIds = [dt0.id, dt1.id];
			exchange.inviter = socket.request.user;

			dt0.save();
			dt1.save();
			exchange.save();

			var idString = exchange._id.toString() + socket.request.user._id.toString();
			var inviter = {
				socketId: socket.id,
				userId: socket.request.user._id,
				exchId: exchange._id,
				doneTaskIds: doneTaskIds
			};

			socket.emit('/#setExchID', exchange._id, idString, doneTaskIds);
			//activeUsers.add_inviter(langs, socket.id);
			activeUsers.add_inviter(langs, inviter, function(){
				var active = activeUsers.get();
				for(var i = 0; i < active[langs].ord.length; i++){ //send to all potential partners
					if(active[langs].ord[i][3] === false){ //check for not busy
						if(!activeUsers.isInvitee(langs, active[langs].ord[i][0])){
							activeUsers.addInvitee(langs, active[langs].ord[i][0]);
							//activeUsers.incInvitees(langs, 1);
							socket.broadcast.to(active[langs].ord[i][2]).emit('/#incomingInvite');
						}
					}
				}
			});
		});

		workflow.on('setReadyOrGo', function(exchangeid, socket) {
			Exchange.findById(exchangeid, function(err, doc){
				if(doc.state === 'init'){
					socket.emit('/#setWaitModal');
					Exchange.update(
					{_id: exchangeid},
				{$set: {
					'state': 'ready',
					'first_socket': socket.id}},
					function (error, numberAffected, raw) {
						if (error) {
							return workflow.emit('exception', error);
						}
					});
				}else if(doc.state === 'ready'){
					socket.emit('/#setPtnrSocket', doc.first_socket);
					socket.broadcast.to(doc.first_socket)
						.emit('/#passSocketInfo', socket.id,
						socket.request.user.seentasks
						);
				}
			});
		});

		workflow.on('exchParams', function(ptnr_socketid, exch_task_inds, exch_langs, socket){
				//console.log('starting async');
				var tasks = [];
				var asyncTasks= [];

				asyncTasks.push(function(cb1){
					mongoose.model('Task').findOne({ ind: exch_task_inds[0] }, function (err, task) {
						if (err) { return cb1(err);}
						tasks[0] = task;
						cb1();
					});
				}
			);

			asyncTasks.push(function(cb2){
				mongoose.model('Task').findOne({ ind: exch_task_inds[1] }, function (err, task) {
					if (err) { return cb2(err);}
					tasks[1] = task;
					cb2();
				});
			}
		);

		async.parallel(asyncTasks, function(){
			// All async tasks are done now

			//this randomly selects one of the two users as the driver.
			//for the loc-inst task type.
			driver = (Math.floor(Math.random()+2) === 0)? 'inviter' : 'invitee';

			socket.emit('/#taskData', exch_task_inds, tasks, exch_langs, driver);
			socket.broadcast.to(ptnr_socketid).emit('/#taskData', exch_task_inds, tasks, exch_langs, driver);
		});

	});

};

exports.createExchange = function(server, socket, target){
	//socket is inviter's socket target is invitee
	workflow.emit('createExchange', server, socket, target);
};

//exports.acceptInvite = function(exchangeid, socket, target){
exports.acceptInvite = function(socket, inviter){

		Exchange.update(
			{_id: inviter.exchId},
			{$set: {'invitee': socket.request.user.id}},
			function (error, numberAffected, raw) {
				if (error) {
					console.log(error);
					return workflow.emit('exception', error);
				}
			});

	var idString = inviter.exchId.toString() + socket.request.user._id.toString();

	//want to set ourself as busy here
	//activeUsers.setBusy(socket.request.user, true);

	activeUsers.remove_inviter(inviter.socketId, function(empty_langclass){
		console.log(empty_langclass);
		if(empty_langclass){
			console.log('No more inviters for'+ empty_langclass);
		}
	});

	socket.emit('/#setIdString', inviter);
	socket.broadcast.to(inviter.socketId).emit('/#accepted', idString);
};

exports.setReadyOrGo = function(exchangeid, socket){
	workflow.emit('setReadyOrGo', exchangeid, socket);
};


exports.exchParams = function(ptnr_socketid, exch_task_inds, exch_langs, socket){
	workflow.emit('exchParams', ptnr_socketid, exch_task_inds, exch_langs, socket);
};


//Not using this because exchange is created by socket

 /* Create a Exchange
*/

exports.create = function(req, res) {
	var exch = new Exchange(req.body);
	exch.user = req.user;

	exch.save(function(err) {
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
 * Show the current Exchange
 */
exports.read = function(req, res) {
	res.jsonp(req.exchange);
};

/**
 * Update a Exchange
 */
exports.update = function(req, res) {
	var exch = req.exchange ;

	exch = _.extend(exch , req.body);

	exch.save(function(err) {
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
 * Delete an Exchange
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
 * List of Exchanges
 */
exports.list = function(req, res) {
	Exchange.find().or([{inviter: req.user.id},{invitee: req.user.id}])
	.sort('-created').limit(10)
	.deepPopulate('doneTasks.learner doneTasks.nativeSpeaker doneTasks.task')
	.exec(function(err, exchanges) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
				res.jsonp(exchanges);
		}
	});
};

/**
 * Exchange middleware
 */
exports.exchangeByID = function(req, res, next, id) {
	Exchange.findById(id).populate('user', 'displayName').exec(function(err, exch) {
		if (err) return next(err);
		if (! exch) return next(new Error('Failed to load Exchange ' + id));
		req.exchange = exch ;
		next();
	});
};

exports.doneTaskByID = function(req, res, next, id) {
	DoneTask.findById(id).exec(function(err, dt) {
		if (err) return next(err);
		if (! dt) return next(new Error('Failed to load DoneTask ' + id));
		req.doneTask = dt;
		next();
	});
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

exports.updateDoneTask = function(req, res) {
	var dt = req.doneTask ;
	dt = _.extend(dt , req.body);

	dt.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(dt);
		}
	});
};

exports.deleteDoneTask = function(req, res){
	var dt = req.doneTask ;

	dt.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(dt);
		}
	});
};

exports.hasAuthorizationDoneTask = function(req, res, next) {
	next();
};
