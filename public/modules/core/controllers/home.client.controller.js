/*jshint multistr: true */
'use strict';


angular.module('core').controller('HomeController', [
'$scope', 'Authentication','$location','Socket', 'ExchInit',
'ModalService', 'ThisExch','SocketSetup','$timeout','Exchanges',
function($scope, Authentication, $location, Socket, ExchInit,
ModalService, ThisExch, SocketSetup, $timeout, Exchanges) {
	// Init module configuration options
	var waitModal;
	var noPtnrModal;
	var modal;

	var exchInvModalOptions = {
		closeButtonText: 'Not now',
		actionButtonText: 'Join the Exchange',
		headerText: 'Exchange invitation',
		bodyText1: 'Somebody has invited you to an exchange.'
	};

	var startExchModalOptions = {
		closeButtonText: 'Cancel',
		actionButtonText: 'Start',
		headerText: 'Start Exchange',
		bodyText1: 'Your partner has been notified and the exchange will begin \
		now.',
		bodyText2: 'This exchange will be recorded for your benefit and for the purposes \
		of improving the service. Any conversations you wish to keep private \
		should be held elsewhere. Click \'Start\' to approve the recording \
		and begin the exchange.'
	};

	var noPtnrModalOptions = {
		closeButtonText: 'Later',
		actionButtonText: 'Go to schedule',
		headerText: 'Bad news',
		bodyText1: 'Sorry, no partners are currently available. Try again later, and be sure \
		to fill in your schedule so that people know when you\'re available.'
	};

	// This provides Authentication context.
	$scope.authentication = Authentication;
	$scope.taskpath = 'https://s3-ap-northeast-1.amazonaws.com/com.convercise.tasks';

	$scope.exchanges = Exchanges.query(); //.$where('this.inviter === Authentication.user._id');


	if(!SocketSetup.setupDone){
		Socket.on('noPtnr', function(){
			//alert('No partner for you bucko');
			$timeout(function(){
				waitModal.close();

				noPtnrModal = ModalService;
				noPtnrModal.showModal({}, noPtnrModalOptions).then(function (result) {
					Socket.emit('/#setNotBusyAndRemoveInvite');
					alert('TODO: Schedule');
				},
				function(cancel){
					Socket.emit('/#setNotBusyAndRemoveInviter');
				});

			}, 2000);
		});

		Socket.on('/#setExchID', function(exchangeid, idString, doneTaskIds){
			//console.log('should be called once, on inviter');
			ThisExch.id = exchangeid;
			ThisExch.role = 'inviter';
			ThisExch.querystring = idString;
			ThisExch.doneTaskIds = doneTaskIds;
		});

		Socket.on('/#setIdString', function(inviter){
			ThisExch.role = 'invitee';
			ThisExch.id = inviter.exchId;
			ThisExch.doneTaskIds = inviter.doneTaskIds;
			ThisExch.ptnrquery = ThisExch.id.toString() + inviter.userId.toString();
			ThisExch.querystring = ThisExch.id.toString() + Authentication.user._id.toString();

			modal = ModalService;
			modal.showModal({}, startExchModalOptions).then(function (result) {
				//ready tells me to go to doexch. Then ready is set to false,
				//so that if the page is reloaded it will default back to /
				ThisExch.ready = true;
				$location.path( '/doexch' );
			},
			function(cancel){
				alert('TODO: Cancel starting exchange Invitee');
			});
		});

		Socket.on('/#incomingInvite', function(){
			modal = ModalService;
			//Join the Exchange modal

			modal.showModal({}, exchInvModalOptions).then(function (result) {
				//console.log('invitee should emit once accept invite');
				console.log(result);
				if(result !== 'disinvited'){
					Socket.emit('/#acceptInvite');
				}
			},
			function(cancel){
				Socket.emit('/#rejectInvite');
			});
		});

		Socket.on('/#accepted', function(ptnrquery){
			ThisExch.ptnrquery = ptnrquery;
			waitModal.close();
			modal = ModalService;
			modal.showModal({}, startExchModalOptions).then(function (result) {
				ThisExch.ready = true;
				$location.path( '/doexch' );
			},
			function(cancel){
				alert('TODO: Cancel starting exchange inviter');
			});
		});

		Socket.on('/#disinvite', function(){
			//activeUsers.incInvitees(revlangs, -1,
			Socket.emit('/#decrementInvitees');
			modal.close('disinvited');
		});

		SocketSetup.setupDone = true;
	}


	$scope.startExch = function() {

		var waitModalDefaults = {
			backdrop: false,
			keyboard: false,
			modalFade: false,
			size: 'sm',
			templateUrl: '/partials/waitModal.html'
		};
		var waitModalOptions = {
			closeButtonText: 'Cancel',
			bodyText1: 'Looking for a partner'
		};

		waitModal = ModalService;

		waitModal.showModal(waitModalDefaults, waitModalOptions)
		.then(function (result) {
			//alert(result);
			return false;
		},
		function(cancel){
			//here we want to remove this user from
			//the inviter's socketid from inviters[langs] array
			//and delete inviter_hash[socketid]
			//also, if inviters[langs] is empty after this, we should
			//send out a message to recipients of the invitation
			ExchInit.cancelInvitation();
			//alert('TODO: Called ExchInit.cancelInvitation');

		});

		ExchInit.findPtnrs();
	};
}
]);
