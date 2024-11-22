app.controller('WorkoutController', function($scope, $http) {
    console.log('WorkoutController loaded');
    
    $scope.workouts = [];

    // Fetch workouts from the database
    $scope.getWorkouts = function() {
        $http.get('http://localhost:3000/api/workouts')
            .then(function(response) {
                $scope.workouts = response.data;
            })
            .catch(function(error) {
                console.error('Error fetching workouts:', error);
            });
    };

    // Add a new workout
    $scope.addWorkout = function() {
        if ($scope.newWorkoutName && $scope.newWorkoutDuration && $scope.newWorkoutIntensity) {
            const newWorkout = {
                name: $scope.newWorkoutName,
                duration: $scope.newWorkoutDuration,
                intensity: $scope.newWorkoutIntensity
            };
            $http.post('http://localhost:3000/api/workouts', newWorkout)
                .then(function(response) {
                    $scope.workouts.push(response.data);
                    $scope.newWorkoutName = '';
                    $scope.newWorkoutDuration = '';
                    $scope.newWorkoutIntensity = '';
                    alert('Workout added successfully!');
                })
                .catch(function(error) {
                    console.error('Error adding workout:', error);
                });
        } else {
            alert('Please fill in all workout details.');
        }
    };

    // Remove a workout
    $scope.removeWorkout = function(id, index) {
        $http.delete(`http://localhost:3000/api/workouts/${id}`)
            .then(function() {
                $scope.workouts.splice(index, 1);
            })
            .catch(function(error) {
                console.error('Error removing workout:', error);
            });
    };

    // Load workouts when the controller is initialized
    $scope.getWorkouts();
});
