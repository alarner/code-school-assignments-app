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
		url: '/instructor/assignment/create',
		templateUrl: 'templates/create-assignment.html',
		controller: 'CreateAssignmentCtrl'
	})
	.state('assignment', {
		url: '/assignment/:id',
		templateUrl: 'templates/assignment.html',
		controller: 'AssignmentCtrl'
	})
	.state('submit', {
		url: '/assignment/:id/submit',
		templateUrl: 'templates/submit.html',
		controller: 'SubmitCtrl'
	})
	.state('permission-denied', {
		url: '/permission-denied',
		templateUrl: 'templates/permission-denied.html',
		controller: 'PermissionDeniedCtrl'
	});

	$urlRouterProvider.otherwise('/');
})
.constant('stateSettings', {
	'login': {
		visibleLoggedIn: false,
		visibleLoggedOut: true,
		requiresType: []
	},
	'register': {
		visibleLoggedIn: false,
		visibleLoggedOut: true,
		requiresType: []
	},
	'dashboard': {
		visibleLoggedIn: true,
		visibleLoggedOut: false,
		requiresType: []
	},
	'create-assignment': {
		visibleLoggedIn: true,
		visibleLoggedOut: false,
		requiresType: [2]
	},
	'assignment': {
		visibleLoggedIn: true,
		visibleLoggedOut: false,
		requiresType: []
	},
	'permission-denied': {
		visibleLoggedIn: true,
		visibleLoggedOut: true,
		requiresType: []
	},
	'submit': {
		visibleLoggedIn: true,
		visibleLoggedOut: false,
		requiresType: [1]
	}
})
.run(function($rootScope, $state, userData, User, stateSettings) {
	if(userData) User.set(userData);
	$rootScope.$on(
		'$stateChangeStart',
		function(event, toState, toParams, fromState, fromParams){
			var go = null;
			if(User.isLoggedIn() && !stateSettings[toState.name].visibleLoggedIn) {
				console.log(1);
				go = 'dashboard';
			}
			else if(!User.isLoggedIn() && !stateSettings[toState.name].visibleLoggedOut) {
				console.log(2);
				go = 'login';
			}
			else if(stateSettings[toState.name].requiresType.length){
				console.log(3);
				if(stateSettings[toState.name].requiresType.indexOf(User.get('type')) < 0) {
					go = 'permission-denied';
				}
			}

			if(go) {
				event.preventDefault();
				$state.go(go);
			}
		}
	);
});