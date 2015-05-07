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
