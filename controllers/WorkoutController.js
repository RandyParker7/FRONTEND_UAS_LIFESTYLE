app.controller('WorkoutController', function($scope) {
    console.log('WorkoutController loaded');
    
    $scope.workouts = [
        { name: 'Morning Yoga', duration: '30 minutes', intensity: 'Low' },
        { name: 'Cardio Blast', duration: '45 minutes', intensity: 'High' },
        { name: 'Strength Training', duration: '60 minutes', intensity: 'Medium' }
    ];

    $scope.addWorkout = function() {
        if ($scope.newWorkoutName && $scope.newWorkoutDuration && $scope.newWorkoutIntensity) {
            $scope.workouts.push({
                name: $scope.newWorkoutName,
                duration: $scope.newWorkoutDuration,
                intensity: $scope.newWorkoutIntensity
            });
            $scope.newWorkoutName = '';
            $scope.newWorkoutDuration = '';
            $scope.newWorkoutIntensity = '';
            alert('Workout added successfully!');
        } else {
            alert('Please fill in all workout details.');
        }
    };

    $scope.removeWorkout = function(index) {
        $scope.workouts.splice(index, 1);
    };
});
