angular.module('app.filters', [])
.filter('reverse', function () {
	return function(items) {
		if(!angular.isArray(items)) {
			return false;
		}

		return items.slice().reverse();
	};
});