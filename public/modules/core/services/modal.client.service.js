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
