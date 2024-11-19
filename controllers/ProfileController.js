app.controller('ProfileController', function($scope) {
    console.log('ProfileController loaded');
    
    $scope.user = {
        name: 'John Doe',
        age: 30,
        bio: 'A fitness enthusiast and healthy lifestyle advocate.'
    };

    $scope.updateProfile = function() {
        console.log('Profile updated:', $scope.user);
        alert('Profile updated successfully!');
    };
});
