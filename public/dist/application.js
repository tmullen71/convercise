'use strict';

// Init the application configuration module for AngularJS application
var ApplicationConfiguration = (function() {
	// Init module configuration options
	var applicationModuleName = 'mean';
	var applicationModuleVendorDependencies = ['ngResource', 'ngAnimate', 'ui.router', 'ui.bootstrap', 'ui.utils', 'btford.socket-io'];

	// Add a new vertical module
	var registerModule = function(moduleName, dependencies) {
		// Create angular module

		// Init module configuration options
		angular.module(moduleName, dependencies || []);

		// Add the module to the AngularJS configuration file
		angular.module(applicationModuleName).requires.push(moduleName);
	};

	return {
		applicationModuleName: applicationModuleName,
		applicationModuleVendorDependencies: applicationModuleVendorDependencies,
		registerModule: registerModule
	};
})();

'use strict';

//Start by defining the main module and adding the module dependencies
angular.module(ApplicationConfiguration.applicationModuleName, ApplicationConfiguration.applicationModuleVendorDependencies);

// Setting HTML5 Location Mode
angular.module(ApplicationConfiguration.applicationModuleName).config(['$locationProvider',
	function($locationProvider) {
		$locationProvider.hashPrefix('!');
	}
]);

//Then define the init function for starting up the application
angular.element(document).ready(function() {
	//Fixing facebook bug with redirect
	if (window.location.hash === '#_=_') window.location.hash = '#!';

	//Then init the app
	angular.bootstrap(document, [ApplicationConfiguration.applicationModuleName]);
});

'use strict';

// Use Application configuration module to register a new module
ApplicationConfiguration.registerModule('articles');

'use strict';


// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('core',['angular-spinkit','angular-momentjs']);

'use strict';

// Use applicaion configuration module to register a new module

ApplicationConfiguration.registerModule('doexch',['core', 'vr.directives.slider']);

'use strict';

// Use Application configuration module to register a new module
ApplicationConfiguration.registerModule('users');
'use strict';

// Configuring the Articles module
angular.module('core').run(['Menus',
function(Menus) {
  // Set top bar menu items
  Menus.addMenuItem('topbar', 'Classroom', 'articles', 'item', '/articles(/create)?');
  Menus.addMenuItem('topbar', 'Track Homework', 'articles', 'item', '/articles(/create)?');
  Menus.addMenuItem('topbar', 'Manage Assignments', 'articles', 'item', '/articles(/create)?');
}
]);

'use strict';

// Setting up route
angular.module('core').config(['$stateProvider', '$urlRouterProvider',
	function($stateProvider, $urlRouterProvider) {
		// Redirect to home view when route not found
		$urlRouterProvider.otherwise('/');

		// Home state routing
		$stateProvider.
		state('home', {
			url: '/',
			//templateUrl: 'modules/core/views/home.client.view.html'
			templateUrl: 'modules/core/views/t_or_s.client.view.html'
		});
	}
]);

'use strict';

angular.module('core').controller('ClassroomController', ['$scope', 'Authentication', 'Classroom',
	function($scope, Authentication, Classroom) {
		$scope.authentication = Authentication;
		$scope.classroom = Classroom.get();
	}
]);

'use strict';

angular.module('core').controller('HeaderController', ['$scope', 'Authentication', 'Menus',
	function($scope, Authentication, Menus) {
		$scope.authentication = Authentication;
		$scope.isCollapsed = false;
	//	if(Authentication.user.roles[0] === 'teacher'){
			$scope.menu = Menus.getMenu('topbar');
	//	}

		$scope.toggleCollapsibleMenu = function() {
			$scope.isCollapsed = !$scope.isCollapsed;
		};

		// Collapsing the menu after navigation
		$scope.$on('$stateChangeSuccess', function() {
			$scope.isCollapsed = false;
		});
	}
]);

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

'use strict';

/**
* @ngdoc directive
* @name publicApp.directive:stretchdown
* @description stretches an element so it almost touches the bottom of the window
* # stretchdown
* This directive resizes the element, and a resize handler keeps it resized.
* It won't stretch if the contents of the div aren't tall enough to reach the
* bottom of the window.  Probably requires jQuery.  This directive should be applied
* to a DIV that contains a single child element that holds the content (like a UL or
* DIV of TABLE) because this child element is measured to determine the natural height
* of the element.
*/

angular.module('core')
  .directive('stretchdown', ["$window", "$timeout", function ($window, $timeout) {
  /**
  * When it links, we attach a handler to the window resize event
  * that will resize the element to stretch down.
  */
  function link(scope, element, attrs) {
    var resize = function() {
      var wh = $window.innerHeight;
  //    var naturalHeight = element.children()[0].offsetHeight;
  //    if (naturalHeight < 300){
  //      naturalHeight = 300;
  //    }
      var boxTop = element[0].getBoundingClientRect().top;
      var newHeight = wh - boxTop - 80;
  //    if (naturalHeight > newHeight) {
        element.css('height', newHeight + 'px');
  //    } else {
  //      element.css('height', naturalHeight + 'px');
  //    }
      return scope.$apply();
    };
    angular.element($window).bind('resize', resize);
    $timeout( resize, 800 );
  }
  return {
    link: link
  };
}]); // directive

'use strict';

angular.module('core')
  .directive('syncPlayer', ["$window", "$timeout", function ($window, $timeout) {
    var link = function(scope, element, attrs) {
      scope.audioSources = element.find('audio');
      scope.playing = false;

      scope.play = function() {
        scope.playing = true;
        angular.forEach(scope.audioSources, function(audio) {
          audio.play();
        });
      };

      scope.pause = function() {
        scope.playing = false;
        angular.forEach(scope.audioSources, function(audio) {
          audio.pause();
        });
      };

      scope.stop = function() {
        scope.playing = false;
        angular.forEach(scope.audioSources, function(audio) {
          audio.currentTime = 0;
          audio.pause();
        });
      };
    };

    return {
      link: link
    }
  }]);

'use strict';

angular.module('core').filter('dur', [
	function() {
		return function(input) {
			// Iif directive logic
			// ...
			var minutes = Math.floor((input/1000)/60);
			var seconds = (input/1000)%60;
			var timestring = seconds + ' seconds';
			if(minutes > 0){
				timestring = minutes + ' minutes and ' + timestring;
			}
			return timestring;
		};
	}
]);

'use strict';

angular.module('core').filter('iif', [
	function() {
		return function(input, trueValue, falseValue) {
			// Iif directive logic
			// ...

			return input ? trueValue : falseValue;
		};
	}
]);

'use strict';

angular.module('core').filter('langs', [
	function() {
		return function(input) {
			// Langs directive logic
			// ...
			var langs = {
				'en':'English',
				'ja':'Japanese'
			};
			return langs[input];
		};
	}
]);

'use strict';

angular.module('core').factory('Classroom', ['$resource',
function($resource) {
  return $resource('classroom/:classroomId', {
    classroomId: '@_id',
  }, {
    update: {
      method: 'PUT'
    }
  });
}
]);

'use strict';


angular.module('core').factory('ExchInit', ['Socket', function(Socket) {
  return {
      findPtnrs : function(){
        //inviter sends to everybody
        Socket.emit('findPtnr');
      },
      cancelInvitation : function(){
        Socket.emit('cancelInvitation');
      }
    };
}]);

'use strict';


//Articles service used for communicating with the articles REST endpoints
angular.module('core').factory('Exchanges', ['$resource',
function($resource) {
  return $resource('exchanges/:exchangeId', {
    exchangeId: '@_id'
  }, {
    update: {
      method: 'PUT'
    }
  });
}
]);

'use strict';

//Menu service used for managing  menus
angular.module('core').service('Menus', [

	function() {
		// Define a set of default roles
		this.defaultRoles = ['teacher'];

		// Define the menus object
		this.menus = {};

		// A private function for rendering decision
		var shouldRender = function(user) {
			if (user) {
				if (!!~this.roles.indexOf('*')) {
					return true;
				} else {
					for (var userRoleIndex in user.roles) {
						for (var roleIndex in this.roles) {
							if (this.roles[roleIndex] === user.roles[userRoleIndex]) {
								return true;
							}
						}
					}
				}
			} else {
				return this.isPublic;
			}

			return false;
		};

		// Validate menu existance
		this.validateMenuExistance = function(menuId) {
			if (menuId && menuId.length) {
				if (this.menus[menuId]) {
					return true;
				} else {
					throw new Error('Menu does not exists');
				}
			} else {
				throw new Error('MenuId was not provided');
			}

			return false;
		};

		// Get the menu object by menu id
		this.getMenu = function(menuId) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Return the menu object
			return this.menus[menuId];
		};

		// Add new menu object by menu id
		this.addMenu = function(menuId, isPublic, roles) {
			// Create the new menu
			this.menus[menuId] = {
				isPublic: isPublic || false,
				roles: roles || this.defaultRoles,
				items: [],
				shouldRender: shouldRender
			};

			// Return the menu object
			return this.menus[menuId];
		};

		// Remove existing menu object by menu id
		this.removeMenu = function(menuId) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Return the menu object
			delete this.menus[menuId];
		};

		// Add menu item object
		this.addMenuItem = function(menuId, menuItemTitle, menuItemURL, menuItemType, menuItemUIRoute, isPublic, roles, position) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Push new menu item
			this.menus[menuId].items.push({
				title: menuItemTitle,
				link: menuItemURL,
				menuItemType: menuItemType || 'item',
				menuItemClass: menuItemType,
				uiRoute: menuItemUIRoute || ('/' + menuItemURL),
				isPublic: ((isPublic === null || typeof isPublic === 'undefined') ? this.menus[menuId].isPublic : isPublic),
				roles: ((roles === null || typeof roles === 'undefined') ? this.menus[menuId].roles : roles),
				position: position || 0,
				items: [],
				shouldRender: shouldRender
			});

			// Return the menu object
			return this.menus[menuId];
		};

		// Add submenu item object
		this.addSubMenuItem = function(menuId, rootMenuItemURL, menuItemTitle, menuItemURL, menuItemUIRoute, isPublic, roles, position) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Search for menu item
			for (var itemIndex in this.menus[menuId].items) {
				if (this.menus[menuId].items[itemIndex].link === rootMenuItemURL) {
					// Push new submenu item
					this.menus[menuId].items[itemIndex].items.push({
						title: menuItemTitle,
						link: menuItemURL,
						uiRoute: menuItemUIRoute || ('/' + menuItemURL),
						isPublic: ((isPublic === null || typeof isPublic === 'undefined') ? this.menus[menuId].items[itemIndex].isPublic : isPublic),
						roles: ((roles === null || typeof roles === 'undefined') ? this.menus[menuId].items[itemIndex].roles : roles),
						position: position || 0,
						shouldRender: shouldRender
					});
				}
			}

			// Return the menu object
			return this.menus[menuId];
		};

		// Remove existing menu object by menu id
		this.removeMenuItem = function(menuId, menuItemURL) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Search for menu item to remove
			for (var itemIndex in this.menus[menuId].items) {
				if (this.menus[menuId].items[itemIndex].link === menuItemURL) {
					this.menus[menuId].items.splice(itemIndex, 1);
				}
			}

			// Return the menu object
			return this.menus[menuId];
		};

		// Remove existing menu object by menu id
		this.removeSubMenuItem = function(menuId, submenuItemURL) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Search for menu item to remove
			for (var itemIndex in this.menus[menuId].items) {
				for (var subitemIndex in this.menus[menuId].items[itemIndex].items) {
					if (this.menus[menuId].items[itemIndex].items[subitemIndex].link === submenuItemURL) {
						this.menus[menuId].items[itemIndex].items.splice(subitemIndex, 1);
					}
				}
			}

			// Return the menu object
			return this.menus[menuId];
		};

		//Adding the topbar menu
		this.addMenu('topbar');
	}
]);

'use strict';

angular.module('core').service('ModalService', ['$modal',
function ($modal) {

  var modal;

  var modalDefaults = {
    backdrop: true,
    keyboard: true,
    modalFade: true,
    templateUrl: '/partials/modal.html'
  };

  var modalOptions = {
    closeButtonText: 'Close',
    actionButtonText: 'OK',
    headerText: 'Proceed?',
    bodyText1: 'Perform this action?',
    bodyText2: ''
  };

  this.showModal = function (customModalDefaults, customModalOptions) {
    if (!customModalDefaults) customModalDefaults = {};
    customModalDefaults.backdrop = 'static';
    return this.show(customModalDefaults, customModalOptions);
  };

  this.show = function (customModalDefaults, customModalOptions) {
    //Create temp objects to work with since we're in a singleton service
    var tempModalDefaults = {};
    var tempModalOptions = {};

    //Map angular-ui modal custom defaults to modal defaults defined in service
    angular.extend(tempModalDefaults, modalDefaults, customModalDefaults);

    //Map modal.html $scope custom properties to defaults defined in service
    angular.extend(tempModalOptions, modalOptions, customModalOptions);

    if (!tempModalDefaults.controller) {
      tempModalDefaults.controller = function ($scope, $modalInstance) {
        $scope.modalOptions = tempModalOptions;
        $scope.modalOptions.ok = function (result) {
          $modalInstance.close(result);
        };
        $scope.modalOptions.close = function (result) {
          $modalInstance.dismiss('cancel');
        };
      };
    }

    modal = $modal.open(tempModalDefaults);
    return modal.result;
    //return $modal.open(tempModalDefaults).result;
  };

  this.close = function (response) {
    modal.close(response);
  };

}]);

/*global io:false */
'use strict';

//socket factory that provides the socket service
angular.module('core').factory('Socket', ['socketFactory','$location',
function(socketFactory, $location) {
  return socketFactory({
    prefix: '',
    ioSocket: io.connect( $location.protocol() + '://' + $location.host() + ':' + $location.port() ),
  });
}
]);

'use strict';

angular.module('core').service('SocketSetup', [function() {
    var socketSetup  = {
      setupDone: false
    };
    return socketSetup;
}]);

'use strict';


angular.module('core').service('ThisExch', ['Authentication', '$http',
  function(Authentication, $http) {
  var exch_tasks = [];
  var exch_data = {};
  var this_exch = {
    ready: false,
    id: null,
    role: null,
    querystring : null,
    doneTaskIds: [],
    //this is the index 0 or 1 or the task for which
    //this user is the learner. That's the doneTask
    //this user will update
    myLearnerInd: null,
    taskTimes: [{begin: null, end: null}, {begin: null, end: null}],
    get_task_inds: function(seens, min){
      if(seens.length === 0){
        exch_tasks = [0,1];
      }else{
        for (var j = 0, len = seens.length; j < len; j++) {
          if(seens[j] === min){
            seens = seens.slice(j+1);
            break;
          }
        }
        var i = 0;
        var offset = seens[0]; //offset represents the difference between a seen's value and its index
        while(exch_tasks.length < 2){
          if(seens[i-offset] && seens[i-offset] > i){
            exch_tasks.push(i);
            offset += 1;
          }else if(seens.length < (i-offset)+1){
            exch_tasks.push(i);
          }
          i += 1;
        }
      }
      console.log(exch_tasks);
      return exch_tasks;
    },
    setExchTasks :function(taskInds){
      exch_tasks = taskInds;
    },
    addSeenTask : function(currentTask){
      console.log('TODO Adding ' + exch_tasks[currentTask] + ' to ' + Authentication.user._id + '\'s seen tasks');
    },
    submitDebrief : function(){
      console.log(Authentication);
    },
    submitExchange : function(doneTasks){
      exch_data.doneTasks = [null,null];
      exch_data.doneTasks[this_exch.myLearnerInd] = {
        'learner': doneTasks[this_exch.myLearnerInd].learner._id,
        'beginTime': this_exch.taskTimes[this_exch.myLearnerInd].begin,
        'endTime': this_exch.taskTimes[this_exch.myLearnerInd].end,
        'duration': Date.parse(this_exch.taskTimes[this_exch.myLearnerInd].end) -
          Date.parse(this_exch.taskTimes[this_exch.myLearnerInd].begin),
        'language': doneTasks[this_exch.myLearnerInd].langs,
        'completed': true,
        'answer': doneTasks[this_exch.myLearnerInd].answer,
        'task': doneTasks[this_exch.myLearnerInd].task._id,
      };
      exch_data.doneTasks[1 - this_exch.myLearnerInd] = {
        'nativeSpeaker': doneTasks[1 - this_exch.myLearnerInd].nativeSpeaker._id,
      };

      var updateDoneTask = function(iCopy){
        $http.put('http://cv-audio-rec1.herokuapp.com/doneTasks/'+this_exch.doneTaskIds[iCopy], exch_data.doneTasks[iCopy])
        .success(function(data){
          console.log('Updated doneTask:' + data);
        });
      };

      for (var i = 0; i <= 1; i++) {
        updateDoneTask(i);
      }

      var exchUpdate;
      if (this_exch.role === 'inviter'){
        exchUpdate = {
          state: 'completed'
        };
      } else if (this_exch.role === 'invitee'){
        exchUpdate = {
          invitee: Authentication.user._id
        };
      }

      $http.put('http://cv-audio-rec1.herokuapp.com/exchanges/'+this_exch.id, exchUpdate)
        .success(function(data){
          console.log('Updated Exchange');
          console.log(data);
        });
    },
    submitRecording: function(recording) {
      var exchUpdate;
      if (this_exch.role === 'inviter'){
        exchUpdate = {
          recordings: {
            inviter: recording
          }
        };
      } else if (this_exch.role === 'invitee'){
        exchUpdate = {
          recordings: {
            invitee: recording
          }
        };
      }

      $http.put('http://cv-audio-rec1.herokuapp.com/exchanges/'+this_exch.id, exchUpdate)
        .success(function(data){
          console.log('Updated Exchange');
          console.log(data);
        });
    }
  };

  return this_exch;
}]);

'use strict';

//Setting up route
angular.module('doexch').config(['$stateProvider',
function($stateProvider) {
  // Exchanges state routing
  $stateProvider.
  state('doexch', {
    url: '/doexch',
    templateUrl: 'modules/doexch/views/doexch.client.view.html'
  });
}
]);

/*global _:false */
/*global ss:false */
'use strict';

angular.module('doexch').controller('DoExchController',[
  '$scope','Socket', 'Authentication', 'ThisExch','$location',
  'DoExchSocketSetup', 'ModalService', '$window', 'LangNames',
  '$rootScope','$moment',
  function($scope, Socket, Authentication, ThisExch, $location,
    DoExchSocketSetup, ModalService, $window, LangNames,
    $rootScope, $moment){
    // Init module configuration options
    var waitModal;
    var driver;

    $rootScope.streamStarted = false;
    $scope.streamStarted = $rootScope.streamStarted;
    $scope.streamSaved = false;
    $scope.recording = '';


    //$scope.config = {};
    $scope.reportRequired = true;
    $scope.reportMinChars = 5;
    $scope.report = '';

    $scope.killPeer = false;

    $scope.ratePartner = 2;
    $scope.ratePartnerSlider = {floor: 0, ceil: 3, step: 1};
    $scope.rateADiff = 2;
    $scope.rateADiffSlider = {floor: 0, ceil: 4, step: 1};
    $scope.rateBDiff = 2;
    $scope.rateBDiffSlider = {floor: 0, ceil: 4, step: 1};
    $scope.comment = '';

    $scope.ratePartnerTrans = function(value) {
      var ratings = [
        'Unresponsive or inappropriate',
        'Often used wrong language',
        'Participated fully in the correct languages',
        'Especially helpful'
        ];
      return ratings[value];
    };

    $scope.rateDiffTrans = function(value) {
      var ratings = [
      'Very easy',
      'Somewhat easy',
      'Neither easy nor difficult',
      'Somewhat difficult',
      'Very difficult'
      ];
      return ratings[value];
    };

    $scope.tasks = [];
    $scope.doneTasks = [{},{}];
    $scope.taskpath = 'https://s3-ap-northeast-1.amazonaws.com/com.convercise.tasks';

    $scope.acceptAnswer = function(){
      $scope.doneTasks[$scope.ct_task].state = 2;
      ThisExch.addSeenTask($scope.ct_task);
      Socket.emit('acceptAnswer', ThisExch.ptnrSocket);
    };

    $scope.wrongAnswer = function(){
      $scope.doneTasks[$scope.ct_task].state = 3;
      Socket.emit('wrongAnswer', ThisExch.ptnrSocket);
    };

    $scope.rightAnswer = function(){
      //
      finishTask();
      Socket.emit('finishTask', ThisExch.ptnrSocket);
    };

    $scope.acceptFinalAnswer = function(){
      //
      finishTask();
      Socket.emit('finishTask', ThisExch.ptnrSocket);
    };

    $scope.submitDebrief = function(){
      ThisExch.submitDebrief($scope.report, $scope.ratePartner, $scope.rateADiff, $scope.rateBDiff, $scope.comment);
    };

    $scope.$on('$destroy', function(){
      Socket.removeListener('chatMessage');
    });

    var finishTask = function(){
      if($scope.ct_task === 0){
        ThisExch.taskTimes[0].end = $moment().format();
        $scope.ct_task = 1;
        $scope.doneTasks[$scope.ct_task].state = 1;
        setCurrent();
        ThisExch.taskTimes[1].begin = $moment().format();
      }else{
        ThisExch.taskTimes[1].end = $moment().format();
        goodbye();
      }
    };

    var goodbye = function(){
      var waitModalDefaults = {
        backdrop: false,
        keyboard: false,
        modalFade: false,
        size: 'sm',
        templateUrl: '/partials/okOnlyModal.html'
      };
      var waitModalOptions = {
        headerText: 'Congratulations!',
        closeButtonText: 'Finish',
        bodyText1: 'You\'ve completed both puzzles.',
        bodyText2: 'Say goodbye to your partner, then click \'Finish\' to go to the debriefing page and complete the exchange.'
      };

      waitModal = ModalService;

      waitModal.showModal(waitModalDefaults, waitModalOptions)
      .then(function (result) {
        //alert(result);
        return false;
      },
      function(cancel){
        Socket.emit('goToDebrief', ThisExch.ptnrSocket);
        debrief();
      });
    };

    var setCurrent = function(){
      var sketch;
      if(ThisExch.role === driver){
        $scope.doneTasks[$scope.ct_task].img = $scope.doneTasks[$scope.ct_task].task.img1;
      }else{
        $scope.doneTasks[$scope.ct_task].img = $scope.doneTasks[$scope.ct_task].task.img2;
      }

      /*
      if(ThisExch.role === driver){
        $scope.tasks[$scope.ct_task].sktch = $scope.tasks[$scope.ct_task].sktch_driv + '.pjs';
      }else{
        $scope.tasks[$scope.ct_task].sktch = $scope.tasks[$scope.ct_task].sktch_inst + '.pjs';
      }
      */

      if($scope.doneTasks[$scope.ct_task].langs === Authentication.user.l1){
        $scope.doneTasks[$scope.ct_task].native = true;
        $scope.doneTasks[$scope.ct_task].nativeSpeaker = Authentication.user;
      }else if($scope.doneTasks[$scope.ct_task].langs === Authentication.user.l2){
        $scope.doneTasks[$scope.ct_task].native = false;
        $scope.doneTasks[$scope.ct_task].learner = Authentication.user;
        ThisExch.myLearnerInd = $scope.ct_task;
      }

      if(!$scope.doneTasks[$scope.ct_task].native){
        $scope.onAnswerChange = function(newValue, oldValue, scope){
          Socket.emit('answerChange', newValue.answer, ThisExch.ptnrSocket);
        };
        $scope.$watch(function(){
          return $scope.doneTasks[$scope.ct_task];
        }, $scope.onAnswerChange, true);
      }
    };

    var debrief = function() {
      $scope.killPeer = true;
      ThisExch.submitExchange($scope.doneTasks);
      $scope.doneTasks[$scope.ct_task].state = 5;
      $scope.$broadcast('refreshSlider');
    };

    if(!DoExchSocketSetup.setupDone){
      Socket.on('/#setWaitModal', function(){
        var waitModalDefaults = {
          backdrop: false,
          keyboard: false,
          modalFade: false,
          size: 'sm',
          templateUrl: '/partials/waitModal.html'
        };
        var waitModalOptions = {
          closeButtonText: 'Cancel',
          bodyText1: 'Your partner will join you in a moment.'
        };

        waitModal = ModalService;

        waitModal.showModal(waitModalDefaults, waitModalOptions)
        .then(function (result) {
          //alert(result);
          return false;
        },
        function(cancel){
          alert('TODO: Cancel starting exchange');
        });
      });

      Socket.on('/#passSocketInfo', function(socketid, partnerseens){
        waitModal.close('responded');
        ThisExch.ptnrSocket = socketid;
        var myseens = Authentication.user.seentasks;
        var seens = _.union(Authentication.user.seentasks, partnerseens).sort(function(a, b){return a-b;});
        var mymin = (typeof myseens[0] !== 'undefined') ? myseens[0] : 0;
        var allmin = (typeof seens[0] !== 'undefined') ? seens[0] : 0;
        var min = mymin > allmin ? mymin : allmin;

        var exch_task_inds = ThisExch.get_task_inds(seens, min);
        var exch_langs = _.shuffle([Authentication.user.l1, Authentication.user.l2]);

        Socket.emit('/#exchParams', ThisExch.ptnrSocket, exch_task_inds, exch_langs);
      });

      Socket.on('/#setPtnrSocket', function(ptnrSocket){
        ThisExch.ptnrSocket = ptnrSocket;
        ThisExch.makeCall = true;
      });

      Socket.on('/#taskData', function(taskInds, tasks, exch_langs, d){
        ThisExch.setExchTasks(taskInds);

        driver = d;
        $scope.ct_task = 0;
        //$scope.tasks = tasks;
        $scope.doneTasks[0].answer = '';
        $scope.doneTasks[1].answer = '';
        $scope.doneTasks[$scope.ct_task].state = 1;
        $scope.doneTasks[0].langs = exch_langs[0];
        $scope.doneTasks[0].langfull = LangNames[exch_langs[0]];
        $scope.doneTasks[1].langs = exch_langs[1];
        $scope.doneTasks[1].langfull = LangNames[exch_langs[1]];
        $scope.doneTasks[0].task = tasks[0];
        $scope.doneTasks[1].task = tasks[1];
        $scope.doneTasks[0].ind = taskInds[0];
        $scope.doneTasks[1].ind = taskInds[1];

        setCurrent();
      });

      Socket.on('answerChange', function(newAnswer){
        if($scope.doneTasks[$scope.ct_task].native){
          $scope.doneTasks[$scope.ct_task].answer = newAnswer;
        }
      });

      Socket.on('acceptAnswer', function(){
        ThisExch.addSeenTask($scope.ct_task);
        $scope.doneTasks[$scope.ct_task].state = 2;
      });

      Socket.on('wrongAnswer', function(){
        $scope.doneTasks[$scope.ct_task].state = 3;
      });

      Socket.on('finishTask', function(){
        finishTask();
      });

      Socket.on('goToDebrief', function(){
        waitModal.close('hungUp');
        debrief();
      });

      Socket.on('recordingSaved', function(filePath) {
        $scope.streamSaved = true;
        $scope.recording = filePath;
        console.log(filePath);
        ThisExch.submitRecording(filePath);
      });

      DoExchSocketSetup.setupDone = true;
  }

  var init = function () {
    if (ThisExch.ready){
      Socket.emit('setReadyOrGo', ThisExch.id);
      //ThisExch.ready gets set to false in the videoChat directive
    } else {
      $location.url('/');
      $window.location.href = '/';
    }
  };

  init();

}]);

/*global $:false */
'use strict';

angular.module('doexch').directive('twentyTwenty', [
function() {
	return {
		restrict: 'A',
		link: function postLink(scope, element, attrs) {
			// Twenty twenty directive logic
			$(element).twentytwenty();

			var intrvl = 0;
			var timer = setInterval(function(){
				$(window).trigger('resize');
				intrvl += 1;
			},1);

			if(intrvl > 20){ clearInterval(timer); }

			//$(window).trigger('resize');
			//element.text('this is the twentyTwenty directive');
		}
	};
}
]);

/*global _:false */
/*global $:false */
/*global io:false */
/*global Peer:false */
'use strict';

angular.module('doexch').directive('videoChat', ['$window', 'ThisExch', '$rootScope', '$moment', 'Socket',
  function($window, ThisExch, $rootScope, $moment, Socket) {
    return {
      restrict: 'E',
      template: '<div><div class="video-container">' +
        '<video class="vid-chat" id="their-video" autoplay></video>' +
        '<video class="vid-chat" id="my-video" muted="true" autoplay></video>' +
        '</div></div>',
      link: function(scope, element, attributes) {
        if (!ThisExch.ready) {
          return null;
        } else {
          ThisExch.ready = false;
        }

        var recorderReady = false;
        var lastChunk = false;
        var remoteStreamReady = false;
        var localStreamReady = false;

        navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

        scope.$watch(attributes.killpeer, function(newValue) {
          if (newValue === true) {
            endCall();
          }
        });

        // PeerJS object
        var peer = new Peer(ThisExch.querystring, {
          key: 'wfoc88235mnp14i',
          debug: 3,
          config: {
            'iceServers': [{
                url: 'stun:stun.l.google.com:19302'
              } // Pass in optional STUN and TURN server for maximum network compatibility
            ]
          }
        });


        peer.on('call', function(call) {
          // Answer the call automatically (instead of prompting user) for demo purposes
          if (window.localStream) {
            call.answer(window.localStream);
          }
          step3(call);
        });

        peer.on('error', function(err) {
          alert(err.message);
          // Return to step 2 if error occurs
          //step2();
        });

        // Click handlers setup
        var makeCall = function(stream) {
          // Initiate a call!
          var call = peer.call(ThisExch.ptnrquery, stream);
          step3(call);
        };

        var endCall = function() {
          window.localStream.stop();
          peer.disconnect();
          lastChunk = true;
          recorderReady = false;
          Socket.emit('audioEnd');
          //window.existingCall.close();
          //step2();
        };

        // Retry if getUserMedia fails
        var step1Retry = function() {
          $('#step1-error').hide();
          step1();
        };

        function step1() {
          // Get audio/video stream
          navigator.getUserMedia({
            audio: true,
            video: true
          }, function(stream) {
            // Set your video displays
            localStreamReady = true;
            if (remoteStreamReady) {
              ThisExch.taskTimes[0].begin = $moment().format();
            }

            scope.$apply(function() {
              scope.$root.streamStarted = true;

              $('#my-video').prop('src', URL.createObjectURL(stream));

              window.localStream = stream;

              if (ThisExch.makeCall) {
                //alert('making call');
                makeCall(stream);
              }

              if (window.existingCall) {
                window.existingCall.answer(stream);
              }
            });

          }, function() {
            $('#step1-error').show();
          });
        }

        function convertFloat32ToInt16(buffer) {
          var l = buffer.length;
          var buf = new Int16Array(l);
          while (l--) {
            buf[l] = Math.min(1, buffer[l])*0x7FFF;
          }
          return buf.buffer;
        }

        function recorderProcess(fileName, e) {
          if (fileName !== null && recorderReady) {
            var leftChannelData = e.inputBuffer.getChannelData(0);
            Socket.emit('audioChunk', { fileName: fileName, last: lastChunk, chunk: convertFloat32ToInt16(leftChannelData) });
          }
        }

        function step3(call) {
          // Hang up on an existing call if present
          if (window.existingCall) {
            window.existingCall.close();
          }

          // Wait for stream on the call, then set peer video display
          call.on('stream', function(stream) {
            remoteStreamReady = true;
            if (localStreamReady) {
              ThisExch.taskTimes[0].begin = $moment().format();

              var mediaConstraints = {
                audio: true
              };

              var fileName = null;
              var audioContext = window.AudioContext;
              var context = new audioContext();
              var audioInput = context.createMediaStreamSource(localStream);
              var bufferSize = 2048;
              // create a javascript node
              var recorder = context.createScriptProcessor(bufferSize, 1, 1);

              Socket.once('audioReady', function(uuid) {
                fileName = uuid;
                recorderReady = true;
                // specify the processing function
                recorder.onaudioprocess = recorderProcess.bind(this, fileName);
                // connect stream to our recorder
                audioInput.connect(recorder);
                // connect our recorder to the previous destination
                recorder.connect(context.destination);
              });

              Socket.emit('audioStart');
            }

            $('#their-video').prop('src', URL.createObjectURL(stream));
          });

          // UI stuff
          window.existingCall = call;
          //call.on('close', step2);
        }

        step1();

      }
    };
  }
]);

'use strict';

angular.module('doexch').service('DoExchSocketSetup', [function() {
  var socketSetup  = {
    setupDone: false
  };
  return socketSetup;
}]);

'use strict';

angular.module('doexch').service('LangNames', [function(){
    var langnames = {
      'ja': 'Japanese',
      'en': 'English'
    };

    return langnames;
}]);

'use strict';

// Config HTTP Error Handling
angular.module('users').config(['$httpProvider',
	function($httpProvider) {
		// Set the httpProvider "not authorized" interceptor
		$httpProvider.interceptors.push(['$q', '$location', 'Authentication',
			function($q, $location, Authentication) {
				return {
					responseError: function(rejection) {
						switch (rejection.status) {
							case 401:
								// Deauthenticate the global user
								Authentication.user = null;

								// Redirect to signin page
								$location.path('signin');
								break;
							case 403:
								// Add unauthorized behaviour
								break;
						}

						return $q.reject(rejection);
					}
				};
			}
		]);
	}
]);
'use strict';

// Setting up route
angular.module('users').config(['$stateProvider',
	function($stateProvider) {
		// Users state routing
		$stateProvider.
		state('profile', {
			url: '/settings/profile',
			templateUrl: 'modules/users/views/settings/edit-profile.client.view.html'
		}).
		state('password', {
			url: '/settings/password',
			templateUrl: 'modules/users/views/settings/change-password.client.view.html'
		}).
		state('accounts', {
			url: '/settings/accounts',
			templateUrl: 'modules/users/views/settings/social-accounts.client.view.html'
		}).
		state('signup', {
			url: '/signup',
			templateUrl: 'modules/users/views/authentication/signup.client.view.html'
		}).
		state('signin', {
			url: '/signin',
			templateUrl: 'modules/users/views/authentication/signin.client.view.html'
		}).
		state('forgot', {
			url: '/password/forgot',
			templateUrl: 'modules/users/views/password/forgot-password.client.view.html'
		}).
		state('reset-invalid', {
			url: '/password/reset/invalid',
			templateUrl: 'modules/users/views/password/reset-password-invalid.client.view.html'
		}).
		state('reset-success', {
			url: '/password/reset/success',
			templateUrl: 'modules/users/views/password/reset-password-success.client.view.html'
		}).
		state('reset', {
			url: '/password/reset/:token',
			templateUrl: 'modules/users/views/password/reset-password.client.view.html'
		});
	}
]);

'use strict';

angular.module('users').controller('AuthenticationController', ['$scope', '$http', '$location', 'Authentication',
	function($scope, $http, $location, Authentication) {
		$scope.authentication = Authentication;

		var langs = [
				{name:'English', short:'en'},
				{name:'Japanese', short:'ja'}
			];
		$scope.langs = langs;

		// If user is signed in then redirect back home
		if ($scope.authentication.user) $location.path('/');

		$scope.signup = function() {
			$http.post('/auth/signup', $scope.credentials).success(function(response) {
				// If successful we assign the response to the global user model
				$scope.authentication.user = response;

				// And redirect to the index page
				$location.path('/');
			}).error(function(response) {
				$scope.error = response.message;
			});
		};

		$scope.signin = function() {
			$http.post('/auth/signin', $scope.credentials).success(function(response) {
				// If successful we assign the response to the global user model
				$scope.authentication.user = response;

				// And redirect to the index page
				$location.path('/');
			}).error(function(response) {
				$scope.error = response.message;
			});
		};
	}
]);

'use strict';

angular.module('users').controller('PasswordController', ['$scope', '$stateParams', '$http', '$location', 'Authentication',
	function($scope, $stateParams, $http, $location, Authentication) {
		$scope.authentication = Authentication;

		//If user is signed in then redirect back home
		if ($scope.authentication.user) $location.path('/');

		// Submit forgotten password account id
		$scope.askForPasswordReset = function() {
			$scope.success = $scope.error = null;

			$http.post('/auth/forgot', $scope.credentials).success(function(response) {
				// Show user success message and clear form
				$scope.credentials = null;
				$scope.success = response.message;

			}).error(function(response) {
				// Show user error message and clear form
				$scope.credentials = null;
				$scope.error = response.message;
			});
		};

		// Change user password
		$scope.resetUserPassword = function() {
			$scope.success = $scope.error = null;

			$http.post('/auth/reset/' + $stateParams.token, $scope.passwordDetails).success(function(response) {
				// If successful show success message and clear form
				$scope.passwordDetails = null;

				// Attach user profile
				Authentication.user = response;

				// And redirect to the index page
				$location.path('/password/reset/success');
			}).error(function(response) {
				$scope.error = response.message;
			});
		};
	}
]);

'use strict';

angular.module('users').controller('SettingsController', ['$scope', '$http', '$location', 'Users', 'Authentication',
	function($scope, $http, $location, Users, Authentication) {
		$scope.user = Authentication.user;

		// If user is not signed in then redirect back home
		if (!$scope.user) $location.path('/');

		// Check if there are additional accounts
		$scope.hasConnectedAdditionalSocialAccounts = function(provider) {
			for (var i in $scope.user.additionalProvidersData) {
				return true;
			}

			return false;
		};

		// Check if provider is already in use with current user
		$scope.isConnectedSocialAccount = function(provider) {
			return $scope.user.provider === provider || ($scope.user.additionalProvidersData && $scope.user.additionalProvidersData[provider]);
		};

		// Remove a user social account
		$scope.removeUserSocialAccount = function(provider) {
			$scope.success = $scope.error = null;

			$http.delete('/users/accounts', {
				params: {
					provider: provider
				}
			}).success(function(response) {
				// If successful show success message and clear form
				$scope.success = true;
				$scope.user = Authentication.user = response;
			}).error(function(response) {
				$scope.error = response.message;
			});
		};

		// Update a user profile
		$scope.updateUserProfile = function(isValid) {
			if (isValid) {
				$scope.success = $scope.error = null;
				var user = new Users($scope.user);

				user.$update(function(response) {
					$scope.success = true;
					Authentication.user = response;
				}, function(response) {
					$scope.error = response.data.message;
				});
			} else {
				$scope.submitted = true;
			}
		};

		// Change user password
		$scope.changeUserPassword = function() {
			$scope.success = $scope.error = null;

			$http.post('/users/password', $scope.passwordDetails).success(function(response) {
				// If successful show success message and clear form
				$scope.success = true;
				$scope.passwordDetails = null;
			}).error(function(response) {
				$scope.error = response.message;
			});
		};
	}
]);

'use strict';

// Authentication service for user variables
angular.module('users').factory('Authentication', ['$window', function($window) {
	var auth = {
		user: $window.user
	};

	return auth;
}]);

'use strict';

// Users service used for communicating with the users REST endpoint
angular.module('users').factory('Users', ['$resource',
	function($resource) {
		return $resource('users', {}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);
