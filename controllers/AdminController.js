app.controller('AdminController', function($scope, $http) {
    const baseUrl = 'http://localhost:3000/api/articles';
    const commentsBaseUrl = 'http://localhost:3000/api/comments';
    const token = localStorage.getItem('authToken');

    const baseUrl1 = 'http://localhost:3000/api/recipes';
    const commentsBaseUrl1 = 'http://localhost:3000/api/recipecomments';

    $scope.articles = [];
    $scope.comments = [];
    $scope.newArticle = {};
    $scope.editingArticle = null;

    $scope.recipes = [];
    $scope.recipeComments = [];
    $scope.newRecipe = {};
    $scope.editingRecipe = null;

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
    $scope.addArticle = function () {
        if (!$scope.newArticle.title || !$scope.newArticle.content || !$scope.newArticle.category) {
            alert('Title, content, and category are required!');
            return;
        }
    
        if ($scope.newArticle.imageFile) {
            const reader = new FileReader();
            reader.onload = function (e) {
                $scope.newArticle.image = e.target.result;
                saveArticle();
            };
            reader.readAsDataURL($scope.newArticle.imageFile);
        } else {
            saveArticle();
        }
    
        function saveArticle() {
            $http.post(baseUrl, $scope.newArticle)
                .then(function (response) {
                    $scope.articles.push(response.data);
                    $scope.newArticle = {};
                    $('#addArticleModal').modal('hide');
                    alert('Article added successfully!');
                })
                .catch(function (error) {
                    console.error('Error adding article:', error);
                    alert('Failed to add article.');
                });
        }
    };

    // Edit an article
    $scope.editArticle = function(article) {
        $scope.editingArticle = angular.copy(article);
    };

    // Update an article
    $scope.updateArticle = function() {
        if (!$scope.editingArticle.title || !$scope.editingArticle.content || !$scope.editingArticle.category) {
            alert('Title, content, and category cannot be empty!');
            return;
        }
    
        console.log('Updating article:', $scope.editingArticle);
    
        $http.put(baseUrl + '/' + $scope.editingArticle._id, $scope.editingArticle)
            .then(function(response) {
                console.log('Article updated successfully:', response);
                const index = $scope.articles.findIndex(article => article._id === response.data._id);
                if (index !== -1) {
                    $scope.articles[index] = response.data;
                }
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

    // Fetch all recipes from the server
    $scope.getRecipes = function() {
        $http.get(baseUrl1)
            .then(function(response) {
                $scope.recipes = response.data;
            })
            .catch(function(error) {
                console.error('Error fetching recipes:', error);
            });
    };

    // Add a new recipe
    $scope.addRecipe = function() {
        if (!$scope.newRecipe.title || !$scope.newRecipe.content || !$scope.newRecipe.category) {
            alert('Title, content, and category are required!');
            return;
        }

        if ($scope.newRecipe.imageFile) {
            const reader = new FileReader();
            reader.onload = function (e) {
                $scope.newRecipe.image = e.target.result;
                saveRecipe();
            };
            reader.readAsDataURL($scope.newRecipe.imageFile);
        } else {
            saveRecipe();
        }

        function saveRecipe() {
            $http.post(baseUrl1, $scope.newRecipe)
                .then(function (response) {
                    $scope.recipes.push(response.data);
                    $scope.newRecipe = {};
                    $('#addRecipeModal').modal('hide');
                    alert('Recipe added successfully!');
                })
                .catch(function (error) {
                    console.error('Error adding recipe:', error);
                    alert('Failed to add recipe.');
                });
        }
    };

    // Edit a recipe
    $scope.editRecipe = function(recipe) {
        $scope.editingRecipe = angular.copy(recipe);
        $('#editRecipeModal').modal('show');
    };

    // Update Recipe
    $scope.updateRecipe = function() {
        if (!$scope.editingRecipe.title || !$scope.editingRecipe.content) {
            alert('Title and content cannot be empty!');
            return;
        }

        $http.put(`${baseUrl1}/${$scope.editingRecipe._id}`, $scope.editingRecipe)
            .then(function(response) {
                const index = $scope.recipes.findIndex(recipe => recipe._id === response.data._id);
                if (index !== -1) {
                    $scope.recipes[index] = response.data;
                }
                $scope.editingRecipe = null;
                $('#editRecipeModal').modal('hide');

                alert('Recipe updated successfully!');
            })
            .catch(function(error) {
                console.error('Error updating recipe:', error);
                alert('Failed to update recipe. Please try again.');
            });
    };

    // Cancel edit
    $scope.cancelEdit = function() {
        $scope.editingRecipe = null;
        $('#editRecipeModal').modal('hide');
        alert('Edit canceled.');
    };

    // Delete a recipe
    $scope.deleteRecipe = function(recipeId) {
        $http.delete(baseUrl1 + '/' + recipeId)
            .then(function() {
                $scope.getRecipes();
                alert('Recipe deleted successfully!');
            })
            .catch(function(error) {
                console.error('Error deleting recipe:', error);
                alert('Failed to delete recipe.');
            });
    };

    // Fetch comments for the recipe
    $scope.getRecipeComments = function() {
        $http.get(commentsBaseUrl1)
            .then(function(response) {
                $scope.recipeComments = response.data;
            })
            .catch(function(error) {
                console.error('Error fetching recipe comments:', error);
            });
    };

    // Delete a comment
    $scope.deleteRecipeComment = function(id) {
        if (!confirm('Are you sure you want to delete this comment?')) return;
    
        $http.delete(commentsBaseUrl1 + `/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
        })
        .then(function() {
            $scope.recipeComments = $scope.recipeComments.filter(comment => comment._id !== id);
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
    $scope.getRecipes();
    $scope.getRecipeComments();
});
