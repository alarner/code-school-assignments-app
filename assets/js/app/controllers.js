angular.module('app.controllers', ['app.services', 'ui.router', 'ngDialog', 'cfp.hotkeys'])
.controller('NavCtrl', function($scope, $state, $rootScope, User, focus, hotkeys) {
	$scope.loggedIn = User.isLoggedIn();
	$scope.grade = false;
	$scope.showGrade = false;
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

	$scope.toggleGradeForm = function() {
		$rootScope.$emit('toggle-grade-form');
	};
})
.controller('LoginCtrl', function($scope, $http, $state, Validate, User) {
	$scope.error = {
		identifier: '',
		password: '',
		generic: ''
	};
})
.controller('InstructorDashboardCtrl', function($scope, $http, $state, User, Assignment) {
	$scope.error = {
		generic: ''
	};
	$scope.loaded = '';
	$scope.assignments = [];
	$scope.user = User;
	$scope.loading = true;

	var originalSubmissions = [];

	async.parallel( {
		assignments: function(cb) {
			$http.get('/assignment?sort=dueAt DESC')
			.success(function(assignments) {
				cb(null, assignments);
			})
			.error(function(err) {
				cb(err);
			});
		},
		submissions: function(cb) {
			var where = { grade: null };
			$http.get('/submission?where='+JSON.stringify(where))
			.success(function(submissions) {
				originalSubmissions = submissions;
				cb(null, submissions);
			})
			.error(function(err) {
				cb(err);
			});
		}
	}, function(err, results) {
		if(err) {
			return $scope.error.generic = err;
		}
		var assignments = Assignment.createList(results.assignments, results.submissions);
		$scope.loading = false;
		$scope.assignments = Assignment.groupListByWeek(assignments);
	});

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
.controller('StudentDashboardCtrl', function($scope, $http, $state, User, Assignment) {
	$scope.error = {
		generic: ''
	};
	$scope.loaded = '';
	$scope.assignments = [];
	$scope.user = User;
	$scope.loading = true;

	async.parallel( {
		assignments: function(cb) {
			$http.get('/assignment?sort=dueAt DESC')
			.success(function(assignments) {
				cb(null, assignments);
			})
			.error(function(err) {
				cb(err);
			});
		},
		submissions: function(cb) {
			$http.get('/submission/mine')
			.success(function(submissions) {
				cb(null, submissions);
			})
			.error(function(err) {
				cb(err);
			});
		}
	}, function(err, results) {
		if(err) {
			return $scope.error.generic = err;
		}
		var assignments = Assignment.createList(results.assignments, results.submissions);
		$scope.loading = false;
		$scope.assignments = Assignment.groupListByWeek(assignments);
	});
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
				distSubdir: assignment.distSubdir || null
			};

			$http.post('/assignment', data)
			.success(function(newAssignment) {
				$state.go('instructor-dashboard');
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
				$state.go('instructor-dashboard');
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
					$state.go('instructor-dashboard');
				})
				.error(function(err) {
					console.log(err);
				});
			}
		});
	};
})
.controller('StudentAssignmentCtrl', function($scope, $stateParams, $http, User, Assignment) {
	$scope.error = {
		generic: ''
	};
	$scope.assignment = false;
	$scope.submissions = false;

	if(!$stateParams.id) {
		$scope.error.generic = 'Unknown assignment';
	}

	async.parallel( {
		assignment: function(cb) {
			$http.get('/assignment/'+$stateParams.id)
			.success(function(assignment) {
				cb(null, assignment);
			})
			.error(function(err) {
				cb(err);
			});
		},
		submissions: function(cb) {
			$http.get('/submission/mine?sort=createdAt ASC')
			.success(function(submissions) {
				cb(null, submissions);
			})
			.error(function(err) {
				cb(err);
			});
		}
	}, function(err, results) {
		if(err) {
			return $scope.error.generic = err;
		}
		var assignments = Assignment.createList([results.assignment], results.submissions);
		$scope.assignment = assignments[0];
		console.log('$scope.assignment');
		console.log($scope.assignment);
	});
})
.controller('InstructorAssignmentCtrl', function($scope, $stateParams, $http, Assignment) {
	$scope.error = {
		generic: ''
	};
	$scope.students = [];

	if(!$stateParams.id) {
		$scope.error.generic = 'Unknown assignment';
	}
	else {
		async.parallel({
			students: function(cb) {
				$http.get('/assignment/summary/'+$stateParams.id)
				.success(function(students) {
					cb(null, students);
				})
				.error(function(err) {
					cb(err);
				})
			},
			assignment: function(cb) {
				$http.get('/assignment/'+$stateParams.id)
				.success(function(assignment) {
					cb(null, assignment);
				})
				.error(function(err) {
					cb(err);
				})
			}
		}, function(err, results) {
			if(err) return $scope.error.generic = err.summary || err;
			$scope.assignment = results.assignment;
			_.each(results.students, function(student) {
				student.assignment = new Assignment.AssignmentModel(
					results.assignment,
					student.submissions
				);
			})
			$scope.students = results.students;
		})
		
	}
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

	$http.get('/assignment/'+$stateParams.id)
	.success(function(assignment) {
		$scope.assignment = assignment;
	})
	.error(function(err) {
		$scope.error.generic = err.summary || err;
	});

	$scope.submit = function(submission) {
		submission.assignment = $stateParams.id;
		$scope.error = Validate.submission(submission);

		if(!Validate.hasError($scope.error)) {
			// submission.
			$http.post('/submission', submission)
			.success(function(newSubmission) {
				$state.go('student-dashboard');
			})
			.error(function(err) {
				$scope.error.generic = err.summary || err;
			});
		}
	};
})
.controller('GradeCtrl', function($scope, $rootScope, $stateParams, $http, $state, hotkeys, focus) {
	function toggleGradeForm() {
		$scope.showGrade = !$scope.showGrade
		focus('grade-notes');
	}

	function setScore(score) {
		return function() {
			if(!$scope.notes) {
				$scope.error.notes = true;
				focus('grade-notes');
			}
			else {
				$http.post('/grade/submission', {
					submissionId: $stateParams.submissionId,
					score: score,
					notes: $scope.notes
				})
				.success(function(data) {
					var where = { grade: null, assignment: $stateParams.assignmentId };
					$http.get('/submission?where='+JSON.stringify(where))
					.success(function(data) {
						if(data.length) {
							var submission = data[0];
							$state.go('grade', {
								assignmentId: $stateParams.assignmentId,
								submissionId: submission.id
							});
						}
						else {
							$state.go('instructor-dashboard');
						}
					})
					.error(function(err) {
						console.log(err);
					});
				})
				.error(function(err) {
					console.log(err);
				});
			}
		}
	}
	$scope.error = {
		notes: false,
		generic: ''
	}
	$scope.submission = null;
	$scope.showGrade = false;
	$scope.notes = '';
	$scope.setScore = setScore;
	$scope.getSrc = function(submission) {
		if(!submission) {
			return '';
		}
		else if(submission.location) {
			return submission.location+'index.html';
		}
		else {
			return submission.url;
		}
	};

	$http.get('/submission/'+$stateParams.submissionId)
	.success(function(submission) {
		if(submission.assignment.id != $stateParams.assignmentId) {
			$scope.error.generic = 'Somehow we grabbed a submission that isn\'t associated with the correct assignment.';
		}
		else {
			$scope.submission = submission;
			console.log($scope.submission);
		}
	})
	.error(function(err) {
		$scope.error.generic = err.summary || err;
	});

	$rootScope.$on('toggle-grade-form', function() {
		toggleGradeForm();
	});

	hotkeys.add({
		combo: 'ctrl+shift+z',
		description: 'Open the grading form.',
		allowIn: ['TEXTAREA'],
		callback: toggleGradeForm
	});

	hotkeys.add({
		combo: 'ctrl+shift+1',
		description: 'Sets the score to "DOA"',
		allowIn: ['TEXTAREA'],
		callback: setScore(0)
	});

	hotkeys.add({
		combo: 'ctrl+shift+2',
		description: 'Sets the score to "INCOMPLETE"',
		allowIn: ['TEXTAREA'],
		callback: setScore(1)
	});

	hotkeys.add({
		combo: 'ctrl+shift+3',
		description: 'Sets the score to "GOOD"',
		allowIn: ['TEXTAREA'],
		callback: setScore(2)
	});

	hotkeys.add({
		combo: 'ctrl+shift+4',
		description: 'Sets the score to "GREAT"',
		allowIn: ['TEXTAREA'],
		callback: setScore(3)
	});
});