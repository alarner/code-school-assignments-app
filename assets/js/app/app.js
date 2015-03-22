angular.module('app', ['app.controllers', 'app.data', 'app.filters', 'app.directives', 'ui.router'])
.config(function($stateProvider, $urlRouterProvider, $locationProvider) {

	// $locationProvider.html5Mode(true);

	$stateProvider
	.state('login', {
		url: '/',
		templateUrl: 'templates/login.html',
		controller: 'LoginCtrl'
	})
	.state('student-dashboard', {
		url: '/student/dashboard',
		templateUrl: 'templates/student/dashboard.html',
		controller: 'StudentDashboardCtrl'
	})
	.state('instructor-dashboard', {
		url: '/instructor/dashboard',
		templateUrl: 'templates/instructor/dashboard.html',
		controller: 'InstructorDashboardCtrl'
	})
	.state('create-assignment', {
		url: '/instructor/assignment/create',
		templateUrl: 'templates/create-assignment.html',
		controller: 'CreateAssignmentCtrl'
	})
	.state('edit-assignment', {
		url: '/instructor/assignment/:id/edit',
		templateUrl: 'templates/edit-assignment.html',
		controller: 'EditAssignmentCtrl'
	})
	.state('student-assignment', {
		url: '/student/assignment/:id',
		templateUrl: 'templates/student/assignment.html',
		controller: 'StudentAssignmentCtrl'
	})
	.state('instructor-assignment', {
		url: '/instructor/assignment/:id',
		templateUrl: 'templates/instructor/assignment.html',
		controller: 'InstructorAssignmentCtrl'
	})
	.state('submit', {
		url: '/student/assignment/:id/submit',
		templateUrl: 'templates/student/submit.html',
		controller: 'SubmitCtrl'
	})
	.state('grade', {
		url: '/grade/:assignmentId/:submissionId',
		templateUrl: 'templates/grade.html',
		controller: 'GradeCtrl'
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
	'student-dashboard': {
		visibleLoggedIn: true,
		visibleLoggedOut: false,
		requiresType: [1]
	},
	'instructor-dashboard': {
		visibleLoggedIn: true,
		visibleLoggedOut: false,
		requiresType: [2]
	},
	'create-assignment': {
		visibleLoggedIn: true,
		visibleLoggedOut: false,
		requiresType: [2]
	},
	'edit-assignment': {
		visibleLoggedIn: true,
		visibleLoggedOut: false,
		requiresType: [2]
	},
	'student-assignment': {
		visibleLoggedIn: true,
		visibleLoggedOut: false,
		requiresType: [1]
	},
	'instructor-assignment': {
		visibleLoggedIn: true,
		visibleLoggedOut: false,
		requiresType: [2]
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
	},
	'grade': {
		visibleLoggedIn: true,
		visibleLoggedOut: false,
		requiresType: [2]
	}
})
.run(function($rootScope, $state, userData, User, stateSettings) {
	if(userData) User.set(userData);
	$rootScope.$on(
		'$stateChangeStart',
		function(event, toState, toParams, fromState, fromParams){
			var go = null;
			if(User.isLoggedIn() && !stateSettings[toState.name].visibleLoggedIn) {
				if(User.isStudent()) {
					go = 'student-dashboard';
				}
				else if(User.isInstructor()) {
					go = 'instructor-dashboard';
				}
			}
			else if(!User.isLoggedIn() && !stateSettings[toState.name].visibleLoggedOut) {
				go = 'login';
			}
			else if(stateSettings[toState.name].requiresType.length){
				if(stateSettings[toState.name].requiresType.indexOf(User.get('type')) < 0) {
					go = 'permission-denied';
				}
			}

			if(go) {
				console.log('go', go);
				event.preventDefault();
				$state.go(go);
			}
			else {
				$rootScope.bodyClass = 'app-'+toState.name;
			}
		}
	);
});