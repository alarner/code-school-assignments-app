angular.module('app.services', [])
.factory('User', function($http) {
	var user = {};
	var events = {
		login: [],
		logout: []
	};

	return {
		isLoggedIn: function() {
			return user.hasOwnProperty('id');
		},
		set: function(u) {
			user = u;
			this.trigger('login', user);
		},
		get: function(prop) {
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