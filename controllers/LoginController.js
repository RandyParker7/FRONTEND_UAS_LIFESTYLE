app.controller('LoginController', function($scope, $location, $http) {
    $scope.loginData = {};
    $scope.errorMessage = '';

    $scope.login = function() {
        $http.post('http://localhost:3000/api/login', $scope.loginData)
            .then(function(response) {
                const token = response.data.token;
                console.log('Generated Token:', token);
                localStorage.setItem('authToken', token);
                
                $location.path('/');
            })
            .catch(function(error) {
                $scope.errorMessage = error.data.message || 'Login failed. Please try again.';
            });
    };
});
