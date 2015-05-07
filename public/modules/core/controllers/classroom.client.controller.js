'use strict';

angular.module('core').controller('ClassroomController', ['$scope', 'Authentication', 'Classroom',
	function($scope, Authentication, Classroom) {
		$scope.authentication = Authentication;
		$scope.classroom = Classroom.get();
	}
]);
