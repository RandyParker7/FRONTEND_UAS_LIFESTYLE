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
        .when('/article/:id', {
            templateUrl: 'views/articleDetails.html',
            controller: 'ArticleDetailsController',
            css: 'css/style.css'
        })
        .when('/food', {
            templateUrl: 'views/food.html',
            controller: 'FoodController',
            css: 'css/style.css'
        })
        .when('/food/:id', {
            templateUrl: 'views/recipeDetails.html',
            controller: 'RecipeDetailsController',
            css: 'css/style.css'
        })
        .when('/workout', {
            templateUrl: 'views/workout.html',
            controller: 'WorkoutController',
            css: 'css/style.css'
        })
        .when('/bmi', {
            templateUrl: 'views/bmi.html',
            controller: 'BmiController',
            css: 'css/style.css'
        })
        .when('/profile', {
            templateUrl: 'views/profile.html',
            controller: 'ProfileController',
            css: 'css/style.css'
        })
        .when('/login', {
            templateUrl: 'views/login.html',
            controller: 'LoginController',
            css: 'css/style.css'
        })
        .when('/register', {
            templateUrl: 'views/register.html',
            controller: 'RegisterController',
            css: 'css/style.css'
        })        
        .when('/admin', {
            templateUrl: 'views/admin.html',
            controller: 'AdminController',
            css: 'css/style.css'
        })        
        .otherwise({
            redirectTo: '/'
        });

    $locationProvider.hashPrefix('');
});

app.directive('fileModel', ['$parse', function($parse) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            const model = $parse(attrs.fileModel);
            const modelSetter = model.assign;

            element.bind('change', function() {
                scope.$apply(function() {
                    modelSetter(scope, element[0].files[0]);
                });
            });
        }
    };
}]);
