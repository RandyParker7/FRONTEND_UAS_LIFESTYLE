app.controller('ProfileController', function($scope, $http, $location) {
    // Fetch the token from localStorage
    const token = localStorage.getItem('authToken');

    // Check if the token exists
    if (!token) {
        $scope.errorMessage = 'You must be logged in to view your profile';
        return;
    }

    // Set the authorization header for the API request
    const headers = {
        'Authorization': 'Bearer ' + token
    };

    // Make the request to fetch user profile
    $http.get('http://localhost:3000/api/profile', { headers: headers })
        .then(function(response) {
            // Successfully fetched the profile
            $scope.user = response.data;
        })
        .catch(function(error) {
            // Handle error
            $scope.errorMessage = error.data.message || 'Failed to fetch profile. Please try again.';
        });

    // Logout function
    $scope.logout = function() {
        localStorage.removeItem('authToken');
        $scope.user = null;  // Clear the user data
        $scope.errorMessage = 'You have successfully logged out.';
        $location.path('/');  // Redirect to the homepage
    };
});
