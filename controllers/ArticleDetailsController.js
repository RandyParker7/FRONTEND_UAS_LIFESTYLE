app.controller('ArticleDetailsController', function($scope, $routeParams, $http) {
    const articleId = $routeParams.id;
    const baseUrl = 'http://localhost:3000/api/articles';
    const commentsBaseUrl = 'http://localhost:3000/api/comments';
    const token = localStorage.getItem('authToken');

    $scope.article = {};
    $scope.articles = [];
    $scope.comments = [];
    $scope.newComment = {};
    $scope.editingComment = null;
    $scope.currentUser = null;

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

                const index = $scope.articles.findIndex(article => article._id === response.data._id);
                if (index !== -1) {
                    $scope.articles[index] = response.data;
                }

                if ($scope.article._id === response.data._id) {
                    $scope.article = response.data;
                }

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

    // Fetch comments for the article
    $scope.getComments = function () {
        $http.get(`${baseUrl}/${articleId}/comments`)
        .then(function (response) {
            $scope.comments = response.data;
        })
        .catch(function (error) {
            console.error('Error fetching comments:', error);
        });
    };
    
    // Add a new comment
    $scope.addComment = function() {
    if (!$scope.newComment.content) {
        alert('Comment content cannot be empty!');
        return;
    }

    const commentData = { content: $scope.newComment.content };

    $http.post(`${baseUrl}/${articleId}/comments`, commentData, {
        headers: { Authorization: `Bearer ${token}` },
    })
        .then(function(response) {
        $scope.comments.push(response.data);
        $scope.newComment = {};
        })
        .catch(function(error) {
        console.error('Error adding comment:', error);
        if (error.status === 401) {
            alert('You must be logged in to comment.');
        }
        });
    };

    // Fetch the current user's username from the token
    $scope.fetchCurrentUser = function() {
    if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        $scope.currentUser = payload.username;
    }
    };
    
    // Edit a comment
    $scope.editComment = function (comment) {
        $scope.editingComment = angular.copy(comment);
    };
    
    // Update a comment
    $scope.updateComment = function () {
        if (!$scope.editingComment.content) {
            alert('Comment content cannot be empty!');
            return;
        }
    
        $http.put(`${commentsBaseUrl}/${$scope.editingComment._id}`, $scope.editingComment)
            .then(function (response) {
                const index = $scope.comments.findIndex(c => c._id === response.data._id);
                if (index !== -1) {
                    $scope.comments[index] = response.data;
                }
                $scope.editingComment = null;
            })
            .catch(function (error) {
                console.error('Error updating comment:', error);
            });
    };
    
    // Delete a comment
    $scope.deleteComment = function (id) {
        $http.delete(`${commentsBaseUrl}/${id}`)
        .then(function () {
            $scope.comments = $scope.comments.filter(c => c._id !== id);
        })
        .catch(function (error) {
            console.error('Error deleting comment:', error);
        });
    };

    
    // Cancel editing a comment
    $scope.cancelEditComment = function () {
        $scope.editingComment = null;
    };
    
    // Initial data fetch
    $scope.fetchCurrentUser();
    $scope.getComments();
});
