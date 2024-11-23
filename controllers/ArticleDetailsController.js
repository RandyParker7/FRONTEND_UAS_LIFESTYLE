app.controller('ArticleDetailsController', function($scope, $routeParams, $http) {
    const articleId = $routeParams.id;
    const baseUrl = 'http://localhost:3000/api/articles';

    $scope.article = {};

    // Fetch the article by ID
    $http.get(`${baseUrl}/${articleId}`)
        .then(function(response) {
            $scope.article = response.data;
        })
        .catch(function(error) {
            console.error('Error fetching article details:', error);
            alert('Error loading article details.');
        });
});
