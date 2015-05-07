'use strict';

angular.module('core').filter('langs', [
	function() {
		return function(input) {
			// Langs directive logic
			// ...
			var langs = {
				'en':'English',
				'ja':'Japanese'
			};
			return langs[input];
		};
	}
]);
