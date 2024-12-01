app.controller('ArticlesController', function($scope, $http) {
    console.log('ArticlesController loaded');
    const baseUrl = 'http://localhost:3000/api/articles';
    
    $scope.articles = [];
    $scope.searchQuery = '';
    $scope.selectedCategory = '';
    $scope.sortBy = '';

    // Fetch articles
    $scope.searchArticles = function() {
        const params = {
            search: $scope.searchQuery,
            category: $scope.selectedCategory,
            sortBy: $scope.sortBy,
        };

        $http.get(baseUrl, { params })
            .then(function(response) {
                $scope.articles = response.data;
            })
            .catch(function(error) {
                console.error('Error fetching articles:', error);
            });
    };

    // Load articles when the controller is initialized
    $scope.searchArticles();
});
