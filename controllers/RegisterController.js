app.controller('RegisterController', function ($scope, $http, $location) {
    $scope.registerData = {};
    $scope.errorMessage = '';
    $scope.successMessage = '';
  
    $scope.register = function () {
      $http.post('http://localhost:3000/api/register', $scope.registerData)
        .then(function (response) {
          $scope.successMessage = response.data.message;
          $scope.errorMessage = '';
          $location.path('/login');
        })
        .catch(function (error) {
          $scope.errorMessage = error.data.message || 'Registration failed. Please try again.';
          $scope.successMessage = '';
        });
    };
  });
  