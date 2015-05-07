'use strict';

angular.module('core').service('SocketSetup', [function() {
    var socketSetup  = {
      setupDone: false
    };
    return socketSetup;
}]);
