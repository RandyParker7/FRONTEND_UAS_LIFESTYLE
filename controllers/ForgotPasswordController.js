app.controller('ForgotPasswordController', function($scope, $http, $location) {
    $scope.resetData = {};
    $scope.errorMessage = '';

    $scope.resetPassword = function() {
        $http.post('http://localhost:3000/api/forgot-password', $scope.resetData)
            .then(function(response) {
                alert('Password reset successful!');
                $location.path('/login');
            })
            .catch(function(error) {
                $scope.errorMessage = error.data.message || 'Password reset failed. Please try again.';
            });
    };
});
