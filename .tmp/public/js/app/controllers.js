angular.module('app.controllers', ['app.services'])
.controller('HomeCtrl', function($scope) {
	
})
.controller('RegisterCtrl', function($scope, $http, $state, Validate) {
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
				console.log('Success!');
				console.log(res);

				if(res.success) {
					$state.go('home');
				}
				else {
					$scope.error.generic = res.errors;
				}
				console.log($scope.error);
			})
			.error(function(err) {
				console.log('Error!');
				console.log(err);
			});
		}
	};
})
.controller('LoginCtrl', function($scope, $http, $state, Validate) {
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
				console.log('Success!');
				console.log(res);

				if(res.success) {
					$state.go('home');
				}
				else {
					$scope.error.generic = res.errors;
				}
				console.log($scope.error);
			})
			.error(function(err) {
				console.log('Error!');
				console.log(err);
			});
		}
	};
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