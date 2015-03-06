angular.module('app.controllers', ['app.services'])
.controller('NavCtrl', function($scope, $state, User) {
	$scope.loggedIn = User.isLoggedIn();
	if($scope.loggedIn) {
		$scope.user = User.get();
	}
	User.on('login', function(u) {
		$scope.loggedIn = true;
		$scope.user = u;
	});
	User.on('logout', function(u) {
		$scope.loggedIn = false;
		$state.go('login');
	});
	$scope.logout = function() {
		User.logout();
	};
})
.controller('HomeCtrl', function($scope) {
	
})
.controller('RegisterCtrl', function($scope, $http, $state, Validate, User) {
	$scope.error = {
		identifier: '',
		password: '',
		generic: ''
	};
	$scope.credentials = {
		identifier: '',
		password: ''
	};

	$scope.register = function(credentials) {
		$scope.error = Validate.credentials(credentials);

		if(!Validate.hasError($scope.error)) {
			var registerObj = {
				username: credentials.identifier,
				email: credentials.identifier,
				password: credentials.password
			};
			$http.post('/auth/local/register', registerObj)
			.success(function(res) {
				User.set(res.user);
				$state.go('dashboard');
			})
			.error(function(err) {
				$scope.error.generic = err.summary;
			});
		}
	};
})
.controller('LoginCtrl', function($scope, $http, $state, Validate, User) {
	$scope.error = {
		identifier: '',
		password: '',
		generic: ''
	};
	$scope.credentials = {
		identifier: 'anlarner@gmail.com',
		password: ''
	};

	console.log($scope.credentials);

	$scope.login = function(htmlCredentials) {
		$scope.error = Validate.credentials(htmlCredentials);

		if(!Validate.hasError($scope.error)) {
			$http.post('/auth/local', htmlCredentials)
			.success(function(res) {
				User.set(res.user);
				$state.go('dashboard');
			})
			.error(function(err) {
				$scope.error.generic = err.summary;
			});
		}
	};
})
.controller('DashboardCtrl', function($scope, $http) {
	$scope.error = {
		generic: ''
	};
	$scope.assignments = [];

	$http.get('/assignment?sort=dueAt DESC')
	.success(function(assignments) {
		var assignmentLists = {};
		_.each(assignments, function(assignment) {
			var mdate = moment(assignment.dueAt);
			var week = mdate.week();
			if(!assignmentLists.hasOwnProperty(week)) {
				assignmentLists[week] = [];
			}
			assignmentLists[week].push(assignment);
		});

		var unsorted = [];
		_.forOwn(assignmentLists, function(val, key) {
			var weekOfYear = parseInt(key);
			unsorted.push({
				week: weekOfYear,
				start: moment().week(weekOfYear).day(1).toDate(),
				end: moment().week(weekOfYear).day(5).toDate(),
				assignments: val
			});
		});
		$scope.assignments = _.sortBy(unsorted, function(val) {
			return -1*val.week;
		});
		console.log($scope.assignments);
	})
	.error(function(err) {
		$scope.error.generic = err.summary || err;
	})
})
.controller('PermissionDeniedCtrl', function($scope) {

})
.controller('CreateAssignmentCtrl', function($scope, $http, $state, Validate) {
	$scope.error = {
		name: '',
		url: '',
		dueDate: '',
		dueTime: '',
		generic: ''
	};
	$scope.assignment = {
		name: '',
		url: '',
		dueDate: moment().add(1, 'day').toDate(),
		dueTime: new Date(1970, 0, 1, 22, 0, 0)
	};

	$scope.create = function(assignment) {
		$scope.error = Validate.assignment(assignment);

		if(!Validate.hasError($scope.error)) {
			var dueAt = moment(assignment.dueDate);
			dueAt.hour(assignment.dueTime.getHours());
			dueAt.minute(assignment.dueTime.getMinutes());
			dueAt.second(assignment.dueTime.getSeconds());
			var data = {
				name: assignment.name,
				url: assignment.url,
				dueAt: dueAt.format('YYYY-MM-DD HH:mm:ss')
			};

			$http.post('/assignment', data)
			.success(function(newAssignment) {
				$state.go('assignment', {id: newAssignment.id});
			})
			.error(function(err) {
				$scope.error.generic = err.summary;
			});
		}
	};
})
.controller('AssignmentCtrl', function($scope, $stateParams, $http) {
	$scope.error = {
		generic: ''
	};
	$scope.assignment = false;

	if(!$stateParams.id) {
		$scope.error.generic = 'Unknown assignment';
	}
	
	$http.get('/assignment/'+$stateParams.id)
	.success(function(assignment) {
		$scope.assignment = assignment;
	})
	.error(function(err) {
		$scope.error.generic = err.summary || err;
	});
})
.controller('SubmitCtrl', function($scope) {

});