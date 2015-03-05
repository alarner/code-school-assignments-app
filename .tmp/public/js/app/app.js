angular.module('app', ['app.controllers', 'app.data', 'ui.router'])
.config(function($stateProvider, $urlRouterProvider, $locationProvider) {

	// $locationProvider.html5Mode(true);

	$stateProvider
	.state('login', {
		url: '/',
		templateUrl: 'templates/login.html',
		controller: 'LoginCtrl'
	})
	.state('register', {
		url: '/user/register',
		templateUrl: 'templates/register.html',
		controller: 'RegisterCtrl'
	})
	.state('dashboard', {
		url: '/dashboard',
		templateUrl: 'templates/dashboard.html',
		controller: 'DashboardCtrl'
	})
	.state('create-assignment', {
		url: '/create-assignment',
		templateUrl: 'templates/create-assignment.html',
		controller: 'CreateAssignmentCtrl'
	});

	$urlRouterProvider.otherwise('/');
})
.constant('stateSettings', {
	'login': {
		visibleLoggedIn: false,
		visibleLoggedOut: true
	},
	'register': {
		visibleLoggedIn: false,
		visibleLoggedOut: true
	},
	'dashboard': {
		visibleLoggedIn: true,
		visibleLoggedOut: false
	},
	'create-assignment': {
		visibleLoggedIn: true,
		visibleLoggedOut: false
	}
})
.run(function($rootScope, $state, userData, User, stateSettings) {
	if(userData) User.set(userData);
	$rootScope.$on(
		'$stateChangeStart',
		function(event, toState, toParams, fromState, fromParams){
			var go = null;
			if(User.isLoggedIn() && !stateSettings[toState.name].visibleLoggedIn) {
				go = 'dashboard';
			}
			else if(!User.isLoggedIn() && !stateSettings[toState.name].visibleLoggedOut) {
				go = 'login';
			}

			if(go) {
				event.preventDefault();
				$state.go(go);
			}
		}
	);
});