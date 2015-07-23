/*global _:false */
/*global $:false */
/*global io:false */
/*global Peer:false */
'use strict';

angular.module('doexch').directive('videoChat', ['$window', 'ThisExch', '$rootScope', '$moment', 'Socket',
  function($window, ThisExch, $rootScope, $moment, Socket) {
    return {
      restrict: 'E',
      template: '<div><div class="video-container">' +
        '<video class="vid-chat" id="their-video" autoplay></video>' +
        '<video class="vid-chat" id="my-video" muted="true" autoplay></video>' +
        '</div></div>',
      link: function(scope, element, attributes) {
        if (!ThisExch.ready) {
          return null;
        } else {
          ThisExch.ready = false;
        }

        var recorderReady = false;
        var lastChunk = false;
        var remoteStreamReady = false;
        var localStreamReady = false;

        navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

        scope.$watch(attributes.killpeer, function(newValue) {
          if (newValue === true) {
            endCall();
          }
        });

        // PeerJS object
        var peer = new Peer(ThisExch.querystring, {
          key: 'wfoc88235mnp14i',
          debug: 3,
          config: {
            'iceServers': [{
                url: 'stun:stun.l.google.com:19302'
              } // Pass in optional STUN and TURN server for maximum network compatibility
            ]
          }
        });


        peer.on('call', function(call) {
          // Answer the call automatically (instead of prompting user) for demo purposes
          if (window.localStream) {
            call.answer(window.localStream);
          }
          step3(call);
        });

        peer.on('error', function(err) {
          alert(err.message);
          // Return to step 2 if error occurs
          //step2();
        });

        // Click handlers setup
        var makeCall = function(stream) {
          // Initiate a call!
          var call = peer.call(ThisExch.ptnrquery, stream);
          step3(call);
        };

        var endCall = function() {
          window.localStream.stop();
          peer.disconnect();
          lastChunk = true;
          recorderReady = false;
          Socket.emit('audioEnd');
          //window.existingCall.close();
          //step2();
        };

        // Retry if getUserMedia fails
        var step1Retry = function() {
          $('#step1-error').hide();
          step1();
        };

        function step1() {
          // Get audio/video stream
          navigator.getUserMedia({
            audio: true,
            video: true
          }, function(stream) {
            // Set your video displays
            localStreamReady = true;
            if (remoteStreamReady) {
              ThisExch.taskTimes[0].begin = $moment().format();
            }

            scope.$apply(function() {
              scope.$root.streamStarted = true;

              $('#my-video').prop('src', URL.createObjectURL(stream));

              window.localStream = stream;

              if (ThisExch.makeCall) {
                //alert('making call');
                makeCall(stream);
              }

              if (window.existingCall) {
                window.existingCall.answer(stream);
              }
            });

          }, function() {
            $('#step1-error').show();
          });
        }

        function convertFloat32ToInt16(buffer) {
          var l = buffer.length;
          var buf = new Int16Array(l);
          while (l--) {
            buf[l] = Math.min(1, buffer[l])*0x7FFF;
          }
          return buf.buffer;
        } 

        function recorderProcess(fileName, e) {
          if (fileName !== null && recorderReady) {
            var leftChannelData = e.inputBuffer.getChannelData(0);
            Socket.emit('audioChunk', { fileName: fileName, last: lastChunk, chunk: convertFloat32ToInt16(leftChannelData) });
          }
        }

        function step3(call) {
          // Hang up on an existing call if present
          if (window.existingCall) {
            window.existingCall.close();
          }

          // Wait for stream on the call, then set peer video display
          call.on('stream', function(stream) {
            remoteStreamReady = true;
            if (localStreamReady) {
              ThisExch.taskTimes[0].begin = $moment().format();

              var mediaConstraints = {
                audio: true
              };

              var fileName = null;
              var audioContext = window.AudioContext;
              var context = new audioContext();
              var audioInput = context.createMediaStreamSource(localStream);
              var bufferSize = 2048;
              // create a javascript node
              var recorder = context.createScriptProcessor(bufferSize, 1, 1);

              Socket.once('audioReady', function(uuid) {
                fileName = uuid;
                recorderReady = true;
                // specify the processing function
                recorder.onaudioprocess = recorderProcess.bind(this, fileName);
                // connect stream to our recorder
                audioInput.connect(recorder);
                // connect our recorder to the previous destination
                recorder.connect(context.destination);
              });

              Socket.emit('audioStart');
            }

            $('#their-video').prop('src', URL.createObjectURL(stream));
          });

          // UI stuff
          window.existingCall = call;
          //call.on('close', step2);
        }

        step1();

      }
    };
  }
]);
