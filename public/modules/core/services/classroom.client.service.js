'use strict';

angular.module('core').factory('Classroom', ['$resource',
function($resource) {
  return $resource('classroom/:classroomId', {
    classroomId: '@_id',
  }, {
    update: {
      method: 'PUT'
    }
  });
}
]);
