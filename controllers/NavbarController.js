app.controller('NavbarController', function($scope, $location) {
    function checkLoginStatus() {
        $scope.isLoggedIn = !!localStorage.getItem('authToken');
    }

    checkLoginStatus();

    $scope.$watch(function() {
        return localStorage.getItem('authToken');
    }, function(newValue, oldValue) {
        if (newValue !== oldValue) {
            checkLoginStatus();
        }
    });

    $scope.logout = function() {
        localStorage.removeItem('authToken');
        $scope.isLoggedIn = false;
        $location.path('/');
    };
});