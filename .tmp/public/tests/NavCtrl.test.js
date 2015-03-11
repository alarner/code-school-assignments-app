describe('NavCtrl', function() {

  var $scope;
  var $http;
  var NavCtrl;
  var User;

  beforeEach(module('app.controllers'));

  beforeEach(inject(function($rootScope, $controller, $injector) {
    $scope = $rootScope.$new();
    User = $injector.get('User');
    NavCtrl = $controller('NavCtrl', {$scope: $scope, User: User});
  }));

  it('should have the user logged out by default', function() {
    expect($scope.loggedIn).to.equal(false);
  });

  it('should update when the user logs in', function() {
    User.set({id: 1});
    expect($scope.loggedIn).to.equal(true);
  });
});