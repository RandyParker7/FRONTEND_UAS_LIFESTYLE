app.controller('RecipeDetailsController', function($scope, $routeParams, $http) {
    const recipeId = $routeParams.id;
    const baseUrl = 'http://localhost:3000/api/recipes';
    const commentsBaseUrl = `http://localhost:3000/api/recipes/${recipeId}/comments`;
    const token = localStorage.getItem('authToken');

    $scope.recipe = {};
    $scope.comments = [];
    $scope.newComment = {};
    $scope.editingComment = null;
    $scope.currentUser = null;

    // Fetch the recipe by ID
    $http.get(`${baseUrl}/${recipeId}`)
        .then(function(response) {
            $scope.recipe = response.data;
        })
        .catch(function(error) {
            console.error('Error fetching recipe details:', error);
            alert('Error loading recipe details.');
        });

    // Remove a recipe
    $scope.removeRecipe = function(id) {
        $http.delete(`${baseUrl}/${id}`)
            .then(function() {
                alert('Recipe deleted successfully.');
                window.location.href = '#/food';
            })
            .catch(function(error) {
                console.error('Error removing recipe:', error);
                alert('Failed to delete recipe. Please try again.');
            });
    };

    // Edit a recipe
    $scope.editRecipe = function(recipe) {
        $scope.editingRecipe = angular.copy(recipe);
    };

    // Update the recipe
    $scope.updateRecipe = function() {
        if (!$scope.editingRecipe.title || !$scope.editingRecipe.content) {
            alert('Title and content cannot be empty!');
            return;
        }

        $http.put(`${baseUrl}/${$scope.editingRecipe._id}`, $scope.editingRecipe)
            .then(function(response) {
                $scope.recipe = response.data;
                $scope.editingRecipe = null;
                alert('Recipe updated successfully!');
            })
            .catch(function(error) {
                console.error('Error updating recipe:', error);
                alert('Failed to update recipe. Please try again.');
            });
    };

    // Fetch comments for the recipe
    $scope.getComments = function() {
        $http.get(`${commentsBaseUrl}`)
            .then(function(response) {
                $scope.comments = response.data;
            })
            .catch(function(error) {
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

        $http.post(commentsBaseUrl, commentData, {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(function(response) {
            $scope.comments.push(response.data);
            $scope.newComment = {};
        })
        .catch(function(error) {
            console.error('Error adding comment:', error);
            if (error.status === 401) {
                alert('You must be logged in to comment.');
            } else {
                alert('An error occurred. Please try again.');
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
    $scope.editComment = function(comment) {
        $scope.editingComment = angular.copy(comment);
    };

    // Update a comment
    $scope.updateComment = function() {
        if (!$scope.editingComment.content) {
            alert('Comment content cannot be empty!');
            return;
        }

        $http.put(`${baseUrl}/${recipeId}/comments/${$scope.editingComment._id}`, $scope.editingComment, {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(function(response) {
            const index = $scope.comments.findIndex(c => c._id === response.data._id);
            if (index !== -1) {
                $scope.comments[index] = response.data;
            }
            $scope.editingComment = null;
        })
        .catch(function(error) {
            console.error('Error updating comment:', error);
        });
    };


    // Delete a comment
    $scope.deleteComment = function(commentId) {
        $http.delete(`${baseUrl}/${recipeId}/comments/${commentId}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(function() {
            $scope.comments = $scope.comments.filter(c => c._id !== commentId);
        })
        .catch(function(error) {
            console.error('Error deleting comment:', error);
            alert('An error occurred while deleting the comment.');
        });
    };

    // Cancel editing a comment
    $scope.cancelEditComment = function() {
        $scope.editingComment = null;
    };

    // Initial data fetch
    $scope.fetchCurrentUser();
    $scope.getComments();
});
