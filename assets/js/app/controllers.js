angular.module('app.controllers', ['app.services', 'ui.router', 'ngDialog'])
.controller('NavCtrl', function($scope, $state, $rootScope, User) {
	$scope.loggedIn = User.isLoggedIn();
	$scope.grade = false;
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
	$rootScope.$on('grade', function(e, params) {
		$scope.grade = params.show;
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
		firstName: '',
		lastName: '',
		generic: ''
	};
	$scope.credentials = {
		identifier: '',
		password: '',
		firstName: '',
		lastName: ''
	};

	$scope.register = function(credentials) {
		$scope.error = Validate.credentials(credentials);

		if(!credentials.firstName) {
			$scope.error.firstName = "Please enter your first name";
		}

		if(!credentials.lastName) {
			$scope.error.lastName = "Please enter your last name";
		}

		if(!Validate.hasError($scope.error)) {
			var registerObj = {
				username: credentials.identifier,
				email: credentials.identifier,
				password: credentials.password,
				firstName: credentials.firstName,
				lastName: credentials.lastName
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
		identifier: 'aero4x@gmail.com',
		password: 'password'
	};

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
.controller('DashboardCtrl', function($scope, $http, $state, User, Assignment) {
	$scope.error = {
		generic: ''
	};
	$scope.loaded = '';
	$scope.assignments = [];
	$scope.user = User;

	var originalAssignments = false;
	var originalSubmissions = false;
	var combine = function() {
		if(originalAssignments === false || originalSubmissions === false) return false;

		var assignments = Assignment.createList(originalAssignments, originalSubmissions);
		$scope.assignments = Assignment.groupListByWeek(assignments);
	};

	$http.get('/assignment?sort=dueAt DESC')
	.success(function(assignments) {
		originalAssignments = assignments;
		combine();
	})
	.error(function(err) {
		$scope.error.generic = err.summary || err;
	});

	if(User.isStudent()) {
		$http.get('/submission/mine')
		.success(function(submissions) {
			originalSubmissions = submissions;
			combine();
		})
		.error(function(err) {
			console.log(err);
		});
	}
	else if(User.isInstructor()) {
		var where = { grade: null };
		$http.get('/submission?where='+JSON.stringify(where))
		.success(function(submissions) {
			originalSubmissions = submissions;
			combine();
		})
		.error(function(err) {
			console.log(err);
		});
	}

	$scope.grade = function(assignmentId) {
		for(var i=0; i<originalSubmissions.length; i++) {
			var assignment = originalSubmissions[i].assignment;
			if(assignment.id === assignmentId) {
				$state.go('grade', {
					assignmentId: assignmentId,
					submissionId: originalSubmissions[i].id
				});
				break;
			}
		}
	};
})
.controller('PermissionDeniedCtrl', function($scope) {

})
.controller('CreateAssignmentCtrl', function($scope, $http, $state, Validate) {
	$scope.error = {
		name: '',
		url: '',
		dueDate: '',
		dueTime: '',
		distSubdir: '',
		generic: ''
	};
	$scope.assignment = {
		name: '',
		url: '',
		dueDate: moment().add(1, 'day').toDate(),
		dueTime: new Date(1970, 0, 1, 22, 0, 0),
		distSubdir: ''
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
				dueAt: dueAt.format('YYYY-MM-DD HH:mm:ss'),
				distSubdir: distSubdir || null
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
.controller('EditAssignmentCtrl', function($scope, $http, $state, $stateParams, Validate, ngDialog) {
	$scope.error = {
		name: '',
		url: '',
		dueDate: '',
		dueTime: '',
		generic: ''
	};
	$scope.assignment = {};

	$http.get('/assignment/'+$stateParams.id)
	.success(function(assignment) {
		$scope.assignment = assignment;
		$scope.assignment.dueDate = moment(assignment.dueAt).toDate();
		$scope.assignment.dueTime = moment(assignment.dueAt).toDate();
	})
	.error(function(err) {
		$scope.error.generic = err.summary || err;
	});

	$scope.edit = function(assignment) {
		$scope.error = Validate.assignment(assignment);

		if(!Validate.hasError($scope.error)) {
			var dueAt = moment(assignment.dueDate);
			dueAt.hour(assignment.dueTime.getHours());
			dueAt.minute(assignment.dueTime.getMinutes());
			dueAt.second(assignment.dueTime.getSeconds());
			var data = {
				name: assignment.name,
				url: assignment.url,
				dueAt: dueAt.format('YYYY-MM-DD HH:mm:ss'),
				distSubdir: assignment.distSubdir || null
			};

			$http.put('/assignment/'+assignment.id, data)
			.success(function(newAssignment) {
				$state.go('assignment', {id: newAssignment.id});
			})
			.error(function(err) {
				$scope.error.generic = err.summary;
			});
		}
	};

	$scope.verifyDelete = function() {
		ngDialog.open({ template: 'templates/partials/verify-delete-assignment.html' })
		.closePromise.then(function (data) {
			if(data.value === 'delete') {
				$http.put('/assignment/'+$stateParams.id, {deletedAt: new Date()})
				.success(function(newAssignment) {
					$state.go('dashboard');
				})
				.error(function(err) {
					console.log(err);
				});
			}
		});
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
.controller('SubmitCtrl', function($scope, $state, $stateParams, $http, Validate) {
	$scope.error = {
		url: '',
		notes: '',
		generic: ''
	};
	$scope.submission = {
		url: '',
		notes: ''
	};

	$scope.submit = function(submission) {
		submission.assignment = $stateParams.id;
		$scope.error = Validate.submission(submission);

		if(!Validate.hasError($scope.error)) {
			// submission.
			$http.post('/submission', submission)
			.success(function(newSubmission) {
				$state.go('dashboard');
			})
			.error(function(err) {
				$scope.error.generic = err.summary || err;
			});
		}
	};
})
.controller('GradeCtrl', function($scope, $stateParams, $http) {
	console.log($stateParams.assignmentId, $stateParams.submissionId);
	$scope.error = {
		generic: ''
	}
	$scope.submission = null;
	$http.get('/submission/'+$stateParams.submissionId)
	.success(function(submission) {
		if(submission.assignment.id != $stateParams.assignmentId) {
			$scope.error.generic = 'Somehow we grabbed a submission that isn\'t associated with the correct assignment.';
		}
		else {
			$scope.submission = submission;
		}
	})
	.error(function(err) {
		$scope.error.generic = err.summary || err;
	});
});