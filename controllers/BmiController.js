app.controller('BmiController', function ($scope) {
    // Default values
    $scope.weight = 60;
    $scope.height = null;
    $scope.bmiResult = null;
    $scope.bmiCategory = null;

    // Initialize progress bar values
    $scope.underweightPercent = 0;
    $scope.normalPercent = 0;
    $scope.overweightPercent = 0;
    $scope.obesityPercent = 0;

    // BMI Calculation Function
    $scope.calculateBMI = function () {
        // Input validation
        if (!$scope.height || $scope.height <= 0) {
            $scope.bmiResult = null;
            $scope.bmiCategory = null;
            alert("Please enter a valid height.");
            return;
        }

        // Calculate BMI
        const heightInMeters = $scope.height / 100;
        const bmi = Number(($scope.weight / (heightInMeters * heightInMeters)).toFixed(1));

        // Update scope variables
        $scope.bmiResult = bmi;
        
        // Determine BMI Category and progress bar percentage
        if (bmi < 18.5) {
            $scope.bmiCategory = 'Underweight';
            $scope.underweightPercent = 100;
            $scope.normalPercent = 0;
            $scope.overweightPercent = 0;
            $scope.obesityPercent = 0;
        } else if (bmi >= 18.5 && bmi < 25) {
            $scope.bmiCategory = 'Normal weight';
            $scope.underweightPercent = 0;
            $scope.normalPercent = 100;
            $scope.overweightPercent = 0;
            $scope.obesityPercent = 0;
        } else if (bmi >= 25 && bmi < 30) {
            $scope.bmiCategory = 'Overweight';
            $scope.underweightPercent = 0;
            $scope.normalPercent = 0;
            $scope.overweightPercent = 100;
            $scope.obesityPercent = 0;
        } else {
            $scope.bmiCategory = 'Obesity';
            $scope.underweightPercent = 0;
            $scope.normalPercent = 0;
            $scope.overweightPercent = 0;
            $scope.obesityPercent = 100;
        }
    };
});