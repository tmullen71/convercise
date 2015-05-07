'use strict';

angular.module('core').filter('dur', [
	function() {
		return function(input) {
			// Iif directive logic
			// ...
			var minutes = Math.floor((input/1000)/60);
			var seconds = (input/1000)%60;
			var timestring = seconds + ' seconds';
			if(minutes > 0){
				timestring = minutes + ' minutes and ' + timestring;
			}
			return timestring;
		};
	}
]);
