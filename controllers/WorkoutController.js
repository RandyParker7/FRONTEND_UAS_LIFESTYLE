app.controller('WorkoutController', function ($scope, $http) {
    const baseUrl = 'http://localhost:3000/api/workouts';
    const token = localStorage.getItem('authToken');

    $scope.workouts = [];
    $scope.currentWorkout = {};
    $scope.isEditing = false;

    function capitalizeName(name) {
        return name
            .toLowerCase()
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    // Fetch all workouts for the logged-in user
    $scope.getWorkouts = function () {
        $http.get(baseUrl, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(function (response) {
                $scope.workouts = response.data;
            })
            .catch(function (error) {
                console.error('Error fetching workouts:', error);
                alert('Failed to load workouts. Please try again.');
            });
    };

    // Add a new workout
    $scope.addWorkout = function () {
        const newWorkout = {
            name: capitalizeName($scope.currentWorkout.name),
            duration: `${$scope.currentWorkout.duration} minute(s)`,
            intensity: $scope.currentWorkout.intensity
        };

        $http.post(baseUrl, newWorkout, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(function (response) {
                response.data.name = capitalizeName(response.data.name);
                $scope.workouts.push(response.data);
                $scope.resetForm();
            })
            .catch(function (error) {
                console.error('Error adding workout:', error);
                alert('An error occurred. Please try again.');
            });
    };

    // Edit a workout
    $scope.editWorkout = function (workout) {
        $scope.currentWorkout = angular.copy(workout);
        $scope.isEditing = true;
        $('#editWorkoutModal').modal('show'); 
    };

    // Update an existing workout
    $scope.updateWorkout = function () {
        const updatedWorkout = {
            name: capitalizeName($scope.currentWorkout.name),
            duration: `${$scope.currentWorkout.duration} minute(s)`,
            intensity: $scope.currentWorkout.intensity
        };
    
        $http.put(`${baseUrl}/${$scope.currentWorkout._id}`, updatedWorkout, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(function (response) {
                const index = $scope.workouts.findIndex(w => w._id === $scope.currentWorkout._id);
                if (index !== -1) {
                    $scope.workouts[index] = {
                        ...$scope.currentWorkout,
                        name: capitalizeName($scope.currentWorkout.name),
                        duration: `${$scope.currentWorkout.duration} minute(s)`,
                        intensity: $scope.currentWorkout.intensity
                    };
                }
                $scope.resetForm();
            })
            .catch(function (error) {
                console.error('Error updating workout:', error);
                alert('Failed to update workout. Please try again.');
            });
    };
    
    // Delete a workout
    $scope.removeWorkout = function (workoutId, index) {
        $http.delete(`${baseUrl}/${workoutId}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(function () {
                $scope.workouts.splice(index, 1);
            })
            .catch(function (error) {
                console.error('Error deleting workout:', error);
                alert('Failed to delete workout. Please try again.');
            });
    };

    // Reset form and cancel edit
    $scope.resetForm = function () {
        $scope.currentWorkout = {};
        $scope.isEditing = false;
        $('#addWorkoutModal').modal('hide'); 
        $('#editWorkoutModal').modal('hide'); 
    };

    // Initial data fetch
    $scope.getWorkouts();
});
