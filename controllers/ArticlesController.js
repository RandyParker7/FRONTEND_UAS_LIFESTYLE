app.controller('ArticlesController', function($scope, $resource, $http) {
    console.log('ArticlesController loaded');

    // Define the Article resource
    const Article = $resource('http://localhost:3000/api/articles/:id', { id: '@_id' }, {
        'update': { method: 'PUT' }
    });

    // Fetch all articles from the server
    $scope.getArticles = function() {
        Article.query().$promise.then(function(data) {
            $scope.articles = data;
        });
    };

    // Add a new article
    $scope.addArticle = function() {
        const newArticle = new Article({
            title: $scope.newArticleTitle,
            content: $scope.newArticleContent
        });
        newArticle.$save().then(function() {
            $scope.getArticles();  // Refresh the list of articles
            $scope.newArticleTitle = '';
            $scope.newArticleContent = '';
        });
    };

    // Remove an article
    $scope.removeArticle = function(id) {
        Article.delete({ id: id }).$promise.then(function() {
            $scope.getArticles();  // Refresh the list of articles
        });
    };

    // Edit an article
    $scope.editArticle = function(article) {
        $scope.editingArticle = angular.copy(article); // Membuat salinan artikel untuk diedit
    };

    // Update the article
    $scope.updateArticle = function() {
        console.log('Updating article:', $scope.editingArticle); // Log artikel yang sedang diedit

        // Gunakan $resource.update untuk memperbarui artikel
        Article.update({ id: $scope.editingArticle._id }, $scope.editingArticle).$promise
            .then(function(response) {
                console.log('Article updated successfully:', response); // Log jika update berhasil

                // Memperbarui artikel di daftar
                const index = $scope.articles.findIndex(article => article._id === response._id);
                if (index !== -1) {
                    $scope.articles[index] = response;
                }

                // Reset form edit setelah sukses
                $scope.editingArticle = null; 
            })
            .catch(function(error) {
                console.error('Error updating article:', error); // Log jika ada error
            });
    };

    // Membatalkan edit
    $scope.cancelEdit = function() {
        $scope.editingArticle = null;
    };

    // Load articles when the controller is initialized
    $scope.getArticles();
});
