app.controller('LoginController', function($scope, $location, $http) {
    $scope.loginData = {};  // Holds the username and password from the form
    $scope.errorMessage = ''; // Holds any error message from failed login

    // Login function called when the form is submitted
    $scope.login = function() {
        // Make an HTTP POST request to the server with the username and password
        $http.post('http://localhost:3000/api/login', $scope.loginData)
            .then(function(response) {
                // Success: store the token in localStorage
                const token = response.data.token;
                console.log('Generated Token:', token);
                localStorage.setItem('authToken', token);
                
                // Redirect to the home page
                $location.path('/');
            })
            .catch(function(error) {
                // Error: show an error message
                $scope.errorMessage = error.data.message || 'Login failed. Please try again.';
            });
    };
});
