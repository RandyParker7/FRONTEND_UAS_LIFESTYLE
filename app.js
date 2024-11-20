var app = angular.module('App', ['ngRoute', 'ngResource']);

app.config(function($routeProvider, $locationProvider) {
    console.log('Configuring routes...');
    $routeProvider
        .when('/', {
            templateUrl: 'views/home.html',
            controller: 'HomeController',
            css: 'css/style.css'
        })
        .when('/article', {
            templateUrl: 'views/articles.html',
            controller: 'ArticlesController',
            css: 'css/style.css'
        })
        .when('/food', {
            templateUrl: 'views/food.html',
            controller: 'FoodController',
            css: 'css/style.css'
        })
        .when('/workout', {
            templateUrl: 'views/workout.html',
            controller: 'WorkoutController',
            css: 'css/style.css'
        })
        .when('/profile', {
            templateUrl: 'views/profile.html',
            controller: 'ProfileController',
            css: 'css/style.css'
        })
        .otherwise({
            redirectTo: '/'
        });

    $locationProvider.hashPrefix('');
});

