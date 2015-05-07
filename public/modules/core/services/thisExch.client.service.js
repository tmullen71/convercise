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
        $http.put('http://localhost:3000/doneTasks/'+this_exch.doneTaskIds[iCopy], exch_data.doneTasks[iCopy])
        .success(function(data){
          console.log('Updated doneTask:' + data);
        });
      };

      for (var i = 0; i <= 1; i++) {
        updateDoneTask(i);
      }

      var exchUpdate;
      if(this_exch.role === 'inviter'){
        exchUpdate = {'state':'completed'};
      }else if(this_exch.role === 'invitee'){
        exchUpdate = {'invitee': Authentication.user._id};
      }

      $http.put('http://localhost:3000/exchanges/'+this_exch.id, exchUpdate)
        .success(function(data){
          console.log('Updated Exchange:' + data);
        });
    },
  };

  return this_exch;
}]);
