app.controller('FoodController', function($scope, $http) {
    console.log('FoodController loaded');
    const baseUrl = 'http://localhost:3000/api/recipes';
    
    $scope.recipes = [];
    $scope.searchQuery = '';
    $scope.selectedCategory = '';
    $scope.sortBy = '';

    // Fetch recipes
    $scope.searchRecipes = function() {
        const params = {
            search: $scope.searchQuery,
            category: $scope.selectedCategory,
            sortBy: $scope.sortBy,
        };

        $http.get(baseUrl, { params })
            .then(function(response) {
                $scope.recipes = response.data;
            })
            .catch(function(error) {
                console.error('Error fetching recipes:', error);
            });
    };

    // Load recipes when the controller is initialized
    $scope.searchRecipes();
});
