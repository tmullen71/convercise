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
