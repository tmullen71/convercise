'use strict';

module.exports = {
	app: {
		title: 'Convercise',
		description: 'Language Exchange Environment',
		keywords: 'mongodb, express, angularjs, node.js, mongoose, passport'
	},
	port: process.env.PORT || 3000,
	templateEngine: 'swig',
	// The secret should be set to a non-guessable string that
	// is used to compute a session hash
	sessionSecret: 'MEAN',
	// The name of the MongoDB collection to store sessions in
	sessionCollection: 'sessions',
	// The session cookie settings
	sessionCookie: {
		path: '/',
		httpOnly: true,
		// If secure is set to true then it will cause the cookie to be set
		// only when SSL-enabled (HTTPS) is used, and otherwise it won't
		// set a cookie. 'true' is recommended yet it requires the above
		// mentioned pre-requisite.
		secure: false,
		// Only set the maxAge to null if the cookie shouldn't be expired
		// at all. The cookie will expunge when the browser is closed.
		maxAge: null,
		// To set the cookie in a specific domain uncomment the following
		// setting:
		// domain: 'yourdomain.com'
	},
	// The session cookie name
	sessionName: 'connect.sid',
	log: {
		// Can specify one of 'combined', 'common', 'dev', 'short', 'tiny'
		format: 'combined',
		// Stream defaults to process.stdout
		// Uncomment to enable logging to a log on the file system
		options: {
			stream: 'access.log'
		}
	},
	assets: {
		lib: {
			css: [
				'public/lib/bootstrap/dist/css/bootstrap.css',
	//			'public/lib/bootstrap/dist/css/bootstrap-theme.css',
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
				'public/lib/jquery/dist/jquery.min.js',
				'public/lib/twentytwenty/js/jquery.event.move.js',
				'public/lib/twentytwenty/js/jquery.twentytwenty.js',
				'public/lib/venturocket-angular-slider/build/angular-slider.js',
				'public/lib/peerjs/peer.js',
				'public/lib/moment/moment.js',
				'public/lib/angular-momentjs/angular-momentjs.js'
			]
		},
		css: [
			'public/modules/**/css/*.css'
		],
		js: [
			'public/config.js',
			'public/application.js',
			'public/modules/*/*.js',
			'public/modules/*/*[!tests]*/*.js'
		],
		tests: [
			'public/lib/angular-mocks/angular-mocks.js',
			'public/modules/*/tests/*.js'
		]
	}
};
