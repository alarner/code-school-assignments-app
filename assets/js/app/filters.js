angular.module('app.filters', [])
.filter('reverse', function () {
	return function(items) {
		if(!angular.isArray(items)) {
			return false;
		}

		return items.slice().reverse();
	};
})
.filter('trustAsResourceUrl', ['$sce', function($sce) {
    return function(val) {
        return $sce.trustAsResourceUrl(val);
    };
}]);