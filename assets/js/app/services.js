angular.module('app.services', [])
.factory('AssignmentStatus', function() {
	return {
		LATE: {
			cssClass: 'late',
			name: 'Late',
			color: 'danger'
		},
		NOT_SUBMITTED: {
			cssClass: 'not-submitted',
			name: 'Not Submitted',
			color: 'default'
		},
		SUBMITTED: {
			cssClass: 'submitted',
			name: 'Submitted',
			color: 'success'
		},
		DOA: {
			cssClass: 'doa',
			name: 'DOA',
			color: 'danger'
		},
		INCOMPLETE: {
			cssClass: 'incomplete',
			name: 'Incomplete',
			color: 'warn'
		},
		GOOD: {
			cssClass: 'good',
			name: 'Good',
			color: 'success'
		},
		GREAT: {
			cssClass: 'great',
			name: 'Great',
			color: 'success'
		},
		UNKNOWN: {
			cssClass: 'unknown',
			name: 'Unknown Status',
			color: 'default'
		}
	};
})
.factory('Assignment', function(AssignmentStatus, Grade) {
	return {
		AssignmentModel: function(assignment, submissions) {
			var self = this;

			if(!_.isArray(submissions)) submissions = [];

			this.submissions = submissions;
			this.attributes = assignment;

			this.attributes.dueAt = moment(this.attributes.dueAt);
			this.attributes.createdAt = moment(this.attributes.createdAt);
			this.attributes.updatedAt = moment(this.attributes.updatedAt);

			_.each(this.submissions, function(submission) {
				if(submission.grade) {
					submission.grade = new Grade.GradeModel(submission.grade);
				}
			})

			// Output can be 'cssClass', 'name', or 'color'
			this.status = function(output) {
				var s = null;
				if(!self.submissions.length) {
					if(self.attributes.dueAt.toDate() < new Date()) {
						s = AssignmentStatus.LATE;
					}
					else {
						s = AssignmentStatus.NOT_SUBMITTED;
					}
				}
				else {
					var submission = self.submissions[0];
					if(!submission.grade) {
						s = AssignmentStatus.SUBMITTED;
					}
					else {
						return submission.grade.convert(output);
					}
				}

				return s[output];
			};

			this.hasSubmission = function() {
				return self.submissions.length;
			};
		},
		createList: function(assignments, submissions) {
			var list = [];
			var AssignmentModel = this.AssignmentModel;

			var keyedSubmissions = {};
			_.each(submissions, function(submission) {
				if(!keyedSubmissions.hasOwnProperty(submission.assignment.id.toString())) {
					keyedSubmissions[submission.assignment.id.toString()] = []
				}
				keyedSubmissions[submission.assignment.id.toString()].push(submission);
			});

			_.each(assignments, function(assignment) {
				list.push(new AssignmentModel(assignment, keyedSubmissions[assignment.id.toString()]));
			});
			return list;
		},

		groupListByWeek: function(list) {
			var assignmentLists = {};
			_.each(list, function(assignment) {
				var mdate = moment(assignment.attributes.dueAt);
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
					start: moment().week(weekOfYear).day(1),
					end: moment().week(weekOfYear).day(5),
					assignments: val
				});
			});
			return _.sortBy(unsorted, function(val) {
				return -1*val.week;
			});
		}
	};
})
.factory('Grade', function(AssignmentStatus) {
	return {
		GradeModel: function(grade) {
			for(var i in grade) {
				this[i] = grade[i];
			}
			var self = this;
			this.convert = function(output) {
				var s = AssignmentStatus.UNKNOWN;
				switch(self.score) {
					case 0:
						s = AssignmentStatus.DOA;
					break;
					case 1:
						s = AssignmentStatus.INCOMPLETE;
					break;
					case 2:
						s = AssignmentStatus.GOOD;
					break;
					case 3:
						s = AssignmentStatus.GREAT;
					break;
					default:
						s = AssignmentStatus.UNKNOWN;
					break;
				}

				return s[output];
			}
		}
	}
})
.factory('User', function($http) {
	var user = {};
	var events = {
		login: [],
		logout: []
	};

	return {
		type: {
			STUDENT: 1,
			INSTRUCTOR: 2
		},
		isLoggedIn: function() {
			return user.hasOwnProperty('id');
		},
		set: function(u) {
			user = u;
			this.trigger('login', user);
		},
		get: function(prop) {
			if(!prop) {
				return user;
			}
			if(user.hasOwnProperty(prop)) {
				return user[prop];
			}
			return null;
		},
		logout: function() {
			user = {};
			this.trigger('logout');
			$http.get('/logout');
		},
		isStudent: function() {
			return (user.type === this.type.STUDENT);
		},
		isInstructor: function() {
			return (user.type === this.type.INSTRUCTOR);
		},
		on: function(event, cb) {
			events[event].push(cb);
		},
		trigger: function(event, obj) {
			_.each(events[event], function(cb) {
				cb(obj);
			});
		}
	};
})
.factory('Validate', function() {
	return {
		credentials: function(credentials) {
			var error = {
				identifier: '',
				password: ''
			};

			if(!credentials.identifier) {
				error.identifier = 'Enter your email address.';
			}
			else if(!validator.isEmail(credentials.identifier)) {
				error.identifier = 'The email address is not valid.';
			}

			if(!credentials.password) {
				error.password = 'Enter a password';
			}

			return error;
		},

		assignment: function(assignment) {
			var error = {
				name: '',
				url: '',
				dueDate: '',
				dueTime: ''
			};

			// Name validations
			if(!assignment.name) {
				error.name = 'Enter the assignment name.';
			}

			// URL validations
			if(!assignment.url) {
				error.url = 'Enter the assignment URL.';
			}
			else if(!validator.isURL(assignment.url, {require_protocol: true})) {
				error.url = 'Invalid url.';
			}

			// Date validations
			if(!_.isDate(assignment.dueDate)) {
				error.dueDate = 'Invalid due date.';
			}
			else {
				var dueDate = moment(assignment.dueDate);
				dueDate.hour(assignment.dueTime.getHours());
				dueDate.minute(assignment.dueTime.getMinutes());
				dueDate.second(assignment.dueTime.getSeconds());
				if(!dueDate.isValid()) {
					error.dueDate = 'Invalid due date or time.';
				}
			}

			return error;
		},

		submission: function(submission) {
			var error = {
				url: '',
				notes: ''
			};

			if(!submission.url) {
				error.url = 'Enter the submission url.';
			}
			else if(!validator.isURL(submission.url, {require_protocol: true})) {
				error.url = 'Invalid url.';
			}

			if(!submission.notes) {
				error.notes = 'Please enter notes.';
			}

			if(!submission.assignment) {
				error.generic = 'The submission must be associated with an assignment.';
			}
			else if(!validator.isInt(submission.assignment.toString())) {
				error.generic = 'The associated assignment must be an integer.';
			}

			return error;
		},

		hasError: function(error) {
			for(var i in error) {
				if(error.hasOwnProperty(i) && error[i]) {
					return true;
				}
			}
			return false;
		}
	};
})
.factory('focus', function ($rootScope, $timeout) {
	return function(name) {
		$timeout(function (){
			$rootScope.$broadcast('focusOn', name);
		});
	}
});