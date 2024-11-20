app.controller('HomeController', function($scope, $timeout) {
    // Initial values for counters
    $scope.counters = [
        { value: 0, target: 1523, label: 'People Helped' },
        { value: 0, target: 2346, label: 'Programs Offered' },
        { value: 0, target: 337, label: 'Workshops Conducted' },
        { value: 0, target: 147, label: 'Partnerships Established' }
    ];

    // Function untuk update counter
    $scope.updateCounter = function(counter) {
        const increment = Math.ceil(counter.target / 500); 

        const animate = function () {
            if (counter.value < counter.target) {
                counter.value += increment; 
                if (counter.value > counter.target) {
                    counter.value = counter.target;  
                }
                $scope.$apply();  
                setTimeout(animate, 10); 
            }
        };

        animate(); 
    };

    $timeout(function() {
        $scope.counters.forEach(function(counter) {
            $scope.updateCounter(counter); 
        });
    }, 500); 
});


console.log(counter);  