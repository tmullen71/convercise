'use strict';

angular.module('core')
  .directive('syncPlayer', function ($window, $timeout) {
    var link = function(scope, element, attrs) {
      scope.audioSources = element.find('audio');
      scope.playing = false;

      scope.play = function() {
        scope.playing = true;
        angular.forEach(scope.audioSources, function(audio) {
          audio.play();
        });
      };

      scope.pause = function() {
        scope.playing = false;
        angular.forEach(scope.audioSources, function(audio) {
          audio.pause();
        });
      };

      scope.stop = function() {
        scope.playing = false;
        angular.forEach(scope.audioSources, function(audio) {
          audio.currentTime = 0;
          audio.pause();
        });
      };
    };

    return {
      link: link
    }
  });
