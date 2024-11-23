app.controller('ArticleDetailsController', function($scope, $routeParams, $http) {
    const articleId = $routeParams.id;
    const baseUrl = 'http://localhost:3000/api/articles';

    $scope.article = {};
    $scope.articles = [];

    // Fetch the article by ID
    $http.get(`${baseUrl}/${articleId}`)
        .then(function(response) {
            $scope.article = response.data;
        })
        .catch(function(error) {
            console.error('Error fetching article details:', error);
            alert('Error loading article details.');
        });

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

    // Remove an article
    $scope.removeArticle = function(id) {
        $http.delete(`${baseUrl}/${id}`)
            .then(function() {
                $scope.getArticles();
                alert('Article deleted successfully.');
                window.location.href = '#/article';
            })
            .catch(function(error) {
                console.error('Error removing article:', error);
                alert('Failed to delete article. Please try again.');
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

                // Jika artikel yang sedang dilihat yang diupdate, update tampilannya
                if ($scope.article._id === response.data._id) {
                    $scope.article = response.data;
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
});
