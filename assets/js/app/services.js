angular.module('app.services', [])
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
});