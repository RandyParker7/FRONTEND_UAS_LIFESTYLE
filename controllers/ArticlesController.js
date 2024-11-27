app.controller('ArticlesController', function($scope, $http) {
    console.log('ArticlesController loaded');
    const baseUrl = 'http://localhost:3000/api/articles';
    
    $scope.articles = [];

    // Fetch all articles from the server
    $scope.getArticles = function() {
        $http.get(baseUrl)
            .then(function(response) {
                $scope.articles = response.data;
            })
            .catch(function(error) {
                console.error('Error fetching articles:', error);
            });
    };

    // Add a new article
    $scope.addArticle = function() {
        if (!$scope.newArticleTitle || !$scope.newArticleContent) {
            alert('Title and content are required!');
            return;
        }
    
        const newArticle = {
            title: $scope.newArticleTitle,
            content: $scope.newArticleContent
        };
    
        $http.post(baseUrl, newArticle)
            .then(function(response) {
                $scope.getArticles();
    
                $scope.newArticleTitle = '';
                $scope.newArticleContent = '';
    
                $('#addArticleModal').modal('hide');
    
                alert('Article added successfully!');
            })
            .catch(function(error) {
                console.error('Error adding article:', error);
    
                alert('Failed to add article. Please try again.');
            });
    };

    // Load articles when the controller is initialized
    $scope.getArticles();
});
