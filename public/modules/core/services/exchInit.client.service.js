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
