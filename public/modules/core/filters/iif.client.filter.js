'use strict';

angular.module('core').filter('iif', [
	function() {
		return function(input, trueValue, falseValue) {
			// Iif directive logic
			// ...

			return input ? trueValue : falseValue;
		};
	}
]);
