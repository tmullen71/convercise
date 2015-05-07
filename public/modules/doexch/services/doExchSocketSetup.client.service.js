'use strict';

angular.module('doexch').service('DoExchSocketSetup', [function() {
  var socketSetup  = {
    setupDone: false
  };
  return socketSetup;
}]);
