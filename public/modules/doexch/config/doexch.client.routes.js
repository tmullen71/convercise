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
