angular.module('app.controllers', ['app.services'])
.controller('HomeCtrl', function($scope) {
	
})
.controller('RegisterCtrl', function($scope, Validate) {
	$scope.error = {
		identifier: '',
		password: ''
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
			console.log(registerObj);
		}
	};
})
.controller('LoginCtrl', function($scope, Validate) {
	$scope.error = {
		identifier: '',
		password: ''
	};
	$scope.credentials = {
		identifier: '',
		password: ''
	};

	$scope.login = function(credentials) {
		$scope.error = Validate.credentials(credentials);

		if(!Validate.hasError($scope.error)) {
			console.log(credentials);
		}
	};
});