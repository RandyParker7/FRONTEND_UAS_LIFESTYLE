app.controller('RegisterController', function ($scope, $http, $location) {
    $scope.registerData = {}; // Holds the username and password from the form
    $scope.errorMessage = ''; // Error messages
    $scope.successMessage = ''; // Success messages
  
    $scope.register = function () {
      // Make an HTTP POST request to the server with the username and password
      $http.post('http://localhost:3000/api/register', $scope.registerData)
        .then(function (response) {
          $scope.successMessage = response.data.message; // Show success message
          $scope.errorMessage = ''; // Clear error messages
          $location.path('/login'); // Redirect to login page
        })
        .catch(function (error) {
          $scope.errorMessage = error.data.message || 'Registration failed. Please try again.';
          $scope.successMessage = ''; // Clear success messages
        });
    };
  });
  