//these are the assets to build together. They should
//be the same as from all.js but minified where possible
//they won't be minified but concatted together to form 1
//vendor.js file
//https://blog.dylants.com/2014/11/19/bundling-production-asssets-for-mean-js/
'use strict';

module.exports = {
  assets: {
    lib: {
      css: [
      'public/lib/bootstrap/dist/css/bootstrap.min.css',
      //'public/lib/bootstrap/dist/css/bootstrap-theme.min.css',
      'public/lib/angular-spinkit/build/angular-spinkit.min.css',
      'public/lib/twentytwenty/css/foundation.css',
      'public/lib/twentytwenty/css/twentytwenty.css'
      ],
      js: [
      'public/lib/angular/angular.js',
      'public/lib/angular-touch/angular-touch.js',
      'public/lib/angular-resource/angular-resource.js',
      'public/lib/angular-animate/angular-animate.js',
      'public/lib/angular-ui-router/release/angular-ui-router.js',
      'public/lib/angular-ui-utils/ui-utils.js',
      'public/lib/socket.io-client/socket.io.js',
      'public/lib/angular-socket-io/socket.js',
      'public/lib/angular-bootstrap/ui-bootstrap-tpls.js',
      'public/lib/lodash/dist/lodash.js',
      'public/lib/angular-lodash/angular-lodash.js',
      'public/lib/angular-spinkit/build/angular-spinkit.js',
      'public/lib/jquery/dist/jquery.js',
      'public/lib/twentytwenty/js/jquery.event.move.js',
      'public/lib/twentytwenty/js/jquery.twentytwenty.js',
      'public/lib/venturocket-angular-slider/build/angular-slider.js',
      'public/lib/peerjs/peer.js',
      //'public/lib/moment/min/moment.min.js',
      'public/lib/moment/moment.js',
      'public/lib/angular-momentjs/angular-momentjs.js'
      ]
    },
    css: 'public/dist/application.min.css',
    //js: 'public/dist/application.min.js'
    js: [
    'public/config.js',
    'public/application.js',
    'public/modules/*/*.js',
    'public/modules/*/*[!tests]*/*.js'
    ]
  }
};
