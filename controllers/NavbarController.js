app.controller('NavbarController', function($scope, $location) {
    function checkLoginStatus() {
        const authToken = localStorage.getItem('authToken');
        $scope.isLoggedIn = !!authToken;
        
        if ($scope.isLoggedIn) {
            try {
                const tokenPayload = JSON.parse(atob(authToken.split('.')[1]));
                $scope.isAdmin = tokenPayload.isAdmin || false;
            } catch (e) {
                $scope.isAdmin = false;
            }
        } else {
            $scope.isAdmin = false;
        }
    }

    checkLoginStatus();

    $scope.$watch(function() {
        return localStorage.getItem('authToken');
    }, function(newValue, oldValue) {
        if (newValue !== oldValue) {
            checkLoginStatus();
        }
    });

    $scope.isLoginOrRegisterPage = function() {
        return $location.path() === '/login' || $location.path() === '/register';
    };
});
