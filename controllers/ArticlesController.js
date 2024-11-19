// Kontroler untuk Articles
app.controller('ArticlesController', function($scope) {
    console.log('ArticlesController loaded');
    $scope.articles = [
        { title: 'Benefits of Yoga', content: 'Yoga improves flexibility and reduces stress.' },
        { title: 'Healthy Breakfast Ideas', content: 'Start your day with energy-packed meals.' }
    ];

    $scope.addArticle = function() {
        $scope.articles.push({ title: $scope.newArticleTitle, content: $scope.newArticleContent });
        $scope.newArticleTitle = '';
        $scope.newArticleContent = '';
    };

    $scope.removeArticle = function(index) {
        $scope.articles.splice(index, 1);
    };
});