var app = angular.module('App', ['ngRoute']);

app.config(function($routeProvider, $locationProvider) {
    console.log('Configuring routes...');
    $routeProvider
        .when('/', {
            templateUrl: 'views/home.html',
            controller: 'HomeController'
        })
        .when('/article', {
            templateUrl: 'views/article.html',
            controller: 'ArticlesController'
        })
        .when('/food', {
            templateUrl: 'views/food.html',
            controller: 'FoodController'
        })
        .when('/workout', {
            templateUrl: 'views/workout.html',
            controller: 'WorkoutController'
        })
        .when('/profile', {
            templateUrl: 'views/profile.html',
            controller: 'ProfileController'
        })
        .otherwise({
            redirectTo: '/'
        });

    $locationProvider.hashPrefix('');
});

// Kontroler untuk Home
app.controller('HomeController', function($scope) {
    console.log('HomeController loaded');
    $scope.message = 'Welcome to the Healthy Lifestyle website!';
});

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
