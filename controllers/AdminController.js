app.controller('AdminController', function($scope, $http) {
    const baseUrl = 'http://localhost:3000/api/articles';
    const commentsBaseUrl = 'http://localhost:3000/api/comments';
    const token = localStorage.getItem('authToken');

    $scope.articles = [];
    $scope.comments = [];
    $scope.newArticle = {};
    $scope.editingArticle = null;

    // Fetch all articles
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
        if (!$scope.newArticle.title || !$scope.newArticle.content) {
            alert('Title and content are required!');
            return;
        }

        $http.post(baseUrl, $scope.newArticle)
            .then(function(response) {
                $scope.articles.push(response.data);
                $scope.newArticle = {}; // Clear form
                $('#addArticleModal').modal('hide');
                alert('Article added successfully!');
            })
            .catch(function(error) {
                console.error('Error adding article:', error);
                alert('Failed to add article.');
            });
    };

    // Edit an article
    $scope.editArticle = function(article) {
        $scope.editingArticle = angular.copy(article);
    };

    // Update an article
    $scope.updateArticle = function() {
        if (!$scope.editingArticle.title || !$scope.editingArticle.content) {
            alert('Title and content cannot be empty!');
            return;
        }
    
        console.log('Updating article:', $scope.editingArticle);
    
        $http.put(baseUrl + '/' + $scope.editingArticle._id, $scope.editingArticle)
            .then(function(response) {
                console.log('Article updated successfully:', response);
    
                // Find and update the article in the articles list
                const index = $scope.articles.findIndex(article => article._id === response.data._id);
                if (index !== -1) {
                    $scope.articles[index] = response.data;
                }
    
                // Clear the editing article object and close the modal
                $scope.editingArticle = null;
                $('#editArticleModal').modal('hide');
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

    // Delete an article
    $scope.deleteArticle = function(id) {
        if (!confirm('Are you sure you want to delete this article?')) return;

        $http.delete(`${baseUrl}/${id}`)
            .then(function() {
                $scope.articles = $scope.articles.filter(article => article._id !== id);
                alert('Article deleted successfully!');
            })
            .catch(function(error) {
                console.error('Error deleting article:', error);
                alert('Failed to delete article.');
            });
    };

    // Fetch all comments
    $scope.getComments = function() {
        $http.get(commentsBaseUrl)
            .then(function(response) {
                $scope.comments = response.data;
            })
            .catch(function(error) {
                console.error('Error fetching comments:', error);
            });
    };

    // Delete a comment
    $scope.deleteComment = function(id) {
        if (!confirm('Are you sure you want to delete this comment?')) return;

        $http.delete(`${commentsBaseUrl}/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(function() {
                $scope.comments = $scope.comments.filter(comment => comment._id !== id);
                alert('Comment deleted successfully!');
            })
            .catch(function(error) {
                console.error('Error deleting comment:', error);
                alert('Failed to delete comment.');
            });
    };

    // Initialize data
    $scope.getArticles();
    $scope.getComments();
});
