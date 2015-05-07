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
  .directive('stretchdown', function ($window, $timeout) {
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
}); // directive
