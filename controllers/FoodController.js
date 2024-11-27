app.controller('FoodController', function($scope, $http) {
    console.log('FoodController loaded');
    const baseUrl = 'http://localhost:3000/api/recipes';
    
    $scope.recipes = [];

    // Fetch all recipes from the server
    $scope.getRecipes = function() {
        $http.get(baseUrl)
            .then(function(response) {
                $scope.recipes = response.data;
            })
            .catch(function(error) {
                console.error('Error fetching recipes:', error);
            });
    };

    // Add a new recipe
    $scope.addRecipe = function() {
        if (!$scope.newRecipeTitle || !$scope.newRecipeContent) {
            alert('Title and content are required!');
            return;
        }
    
        const newRecipe = {
            title: $scope.newRecipeTitle,
            content: $scope.newRecipeContent
        };
    
        $http.post(baseUrl, newRecipe)
            .then(function(response) {
                $scope.getRecipes();
    
                $scope.newRecipeTitle = '';
                $scope.newRecipeContent = '';
    
                $('#addRecipeModal').modal('hide');
    
                alert('Recipe added successfully!');
            })
            .catch(function(error) {
                console.error('Error adding recipe:', error);
    
                alert('Failed to add recipe. Please try again.');
            });
    };

    // Load recipes when the controller is initialized
    $scope.getRecipes();
});
