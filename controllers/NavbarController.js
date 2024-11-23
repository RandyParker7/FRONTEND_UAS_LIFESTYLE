app.controller('NavbarController', function($scope, $location) {
    // Function to update the logged-in state from localStorage
    function checkLoginStatus() {
        $scope.isLoggedIn = !!localStorage.getItem('authToken');
    }

    // Check the initial login status when the controller is initialized
    checkLoginStatus();

    // Watch for changes to localStorage and update the login state
    $scope.$watch(function() {
        return localStorage.getItem('authToken');
    }, function(newValue, oldValue) {
        if (newValue !== oldValue) {
            checkLoginStatus();
        }
    });

    // Handle logout
    $scope.logout = function() {
        localStorage.removeItem('authToken');  // Remove token
        $scope.isLoggedIn = false;  // Update the state
        $location.path('/');  // Redirect to home after logout
    };
});