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
