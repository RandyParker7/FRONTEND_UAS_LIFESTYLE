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
            .then(function() {
                $scope.getArticles();
                $scope.newArticleTitle = '';
                $scope.newArticleContent = '';
                alert('Article added successfully!');
            })
            .catch(function(error) {
                console.error('Error adding article:', error);
                alert('Failed to add article. Please try again.');
            });
    };

    // Remove an article
    $scope.removeArticle = function(id) {
        $http.delete(`${baseUrl}/${id}`)
            .then(function() {
                $scope.getArticles();
            })
            .catch(function(error) {
                console.error('Error removing article:', error);
            });
    };

    // Edit an article
    $scope.editArticle = function(article) {
        $scope.editingArticle = angular.copy(article);
    };

    // Update the article
    $scope.updateArticle = function() {
        if (!$scope.editingArticle.title || !$scope.editingArticle.content) {
            alert('Title and content cannot be empty!');
            return;
        }

        console.log('Updating article:', $scope.editingArticle);

        $http.put(`${baseUrl}/${$scope.editingArticle._id}`, $scope.editingArticle)
            .then(function(response) {
                console.log('Article updated successfully:', response);

                // Memperbarui artikel di daftar
                const index = $scope.articles.findIndex(article => article._id === response.data._id);
                if (index !== -1) {
                    $scope.articles[index] = response.data;
                }

                // Reset form edit setelah sukses
                $scope.editingArticle = null;
                alert('Article updated successfully!');
            })
            .catch(function(error) {
                console.error('Error updating article:', error);
                alert('Failed to update article. Please try again.');
            });
    };

    // Membatalkan edit
    $scope.cancelEdit = function() {
        $scope.editingArticle = null;
        alert('Edit canceled.');
    };

    // Load articles when the controller is initialized
    $scope.getArticles();
});
