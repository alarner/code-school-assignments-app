describe('RegisterCtrl', function() {

  var $scope;
  var $httpBackend;
  var registerRequestHandler;
  var RegisterCtrl;
  var Validate;

  beforeEach(module('app.controllers'));

  beforeEach(inject(function($rootScope, $controller, $injector) {
    $scope = $rootScope.$new();
    $httpBackend = $injector.get('$httpBackend');
    registerRequestHandler = $httpBackend.when('POST', '/auth/local/register')
    .respond({user: {}, redirect: '/'});

    RegisterCtrl = $controller('RegisterCtrl', {$scope: $scope});
  }));

  it('should require a username', function() {
    $scope.register({});
    expect($scope.error.identifier).to.not.equal('');
  });

  it('should not show errors if credentials are valid', function() {
    $scope.register({identifier: 'test@test.com', password: 'password123'});
    expect($scope.error.identifier).to.equal('');
  });

  // it('should throw errors if server returns error status code', function() {
  //   registerRequestHandler.respond(500, {
  //     error: 'E_TESTING',
  //     status: 500,
  //     summary: 'testing error'
  //   });
  //   $scope.register({identifier: 'test@test.com', password: 'password123'});
  //   expect($scope.error.generic).to.equal('testing error');
  // });
});