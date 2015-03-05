angular.module('app.controllers', ['app.services'])
.controller('NavCtrl', function($scope, $state, User) {
	$scope.loggedIn = User.isLoggedIn();
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
		generic: []
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
				if(res.success) {
					User.set(res.user);
					$state.go('dashboard');
				}
				else {
					$scope.error.generic = res.errors;
				}
			})
			.error(function(err) {
				$scope.error.generic = err.errors;
			});
		}
	};
})
.controller('LoginCtrl', function($scope, $http, $state, Validate, User) {
	$scope.error = {
		identifier: '',
		password: '',
		generic: []
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
				if(res.success) {
					User.set(res.user);
					$state.go('dashboard');
				}
				else {
					$scope.error.generic = res.errors;
				}
			})
			.error(function(err) {
				$scope.error.generic = err.errors;
			});
		}
	};
})

.controller('DashboardCtrl', function($scope) {

})

.controller('CreateAssignmentCtrl', function($scope, Validate) {
	$scope.error = {
		name: '',
		url: '',
		dueDate: '',
		dueTime: '',
		generic: []
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
			console.log(data);
		}
	};
});