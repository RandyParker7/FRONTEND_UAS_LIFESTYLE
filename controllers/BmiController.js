app.controller('BmiController', function ($scope) {
    // Default values
    $scope.weight = 60;
    $scope.height = null;
    $scope.bmiResult = null;
    $scope.bmiCategory = null;
    $scope.bmiHistory = JSON.parse(localStorage.getItem('bmiHistory')) || [];

    // Initialize progress bar values
    $scope.pointerPosition = 0;

    $scope.calculateBMI = function () {
        if (!$scope.height || $scope.height <= 0) {
            alert("Please enter a valid height.");
            return;
        }
    
        const heightInMeters = $scope.height / 100;
        const bmi = Number(($scope.weight / (heightInMeters * heightInMeters)).toFixed(1));
    
        $scope.bmiResult = bmi;
    
        if (bmi < 18.5) {
            $scope.bmiCategory = 'Underweight';
            $scope.pointerPosition = (bmi / 18.5) * 18.5; // Calculate position in percentage
        } else if (bmi >= 18.5 && bmi < 25) {
            $scope.bmiCategory = 'Normal weight';
            $scope.pointerPosition = 18.5 + ((bmi - 18.5) / (25 - 18.5)) * 25;
        } else if (bmi >= 25 && bmi < 30) {
            $scope.bmiCategory = 'Overweight';
            $scope.pointerPosition = 43.5 + ((bmi - 25) / (30 - 25)) * 15;
        } else {
            $scope.bmiCategory = 'Obesity';
            $scope.pointerPosition = 58.5 + ((bmi - 30) / (50 - 30)) * 41.5; // Assuming max BMI = 50
        }
    
        $scope.bmiHistory.push({
            weight: $scope.weight,
            height: $scope.height,
            bmi: $scope.bmiResult,
            category: $scope.bmiCategory
        });
        localStorage.setItem('bmiHistory', JSON.stringify($scope.bmiHistory));
    };
    
    // Reset Function
    $scope.resetInputs = function () {
        $scope.weight = 60;
        $scope.height = null;
        $scope.bmiResult = null;
        $scope.bmiCategory = null;
        $scope.pointerPosition = 0;
    };
});