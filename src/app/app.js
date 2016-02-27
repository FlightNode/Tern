/* global $ */
'use strict';

var flnd = {}; // jshint ignore:line

angular
  .module('flightNodeApp', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'ui.grid',
    'userMessage',
    'roleProxy',
    'ui.bootstrap.datepicker',
    'authService',
    'angular-jwt',
    'ngCsv',
    'navigationService',
    'ui.bootstrap.modal',
    'ui.bootstrap.timepicker',
    'ui.grid.selection',
    'censusFormService'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'app/views/main.html',
        controller: 'MainController',
        title: 'FlightNode - Home'
      })
      .when('/login', {
        templateUrl: 'app/views/login.html',
        controller: 'LoginController',
        title: 'FlightNode - Login'
      })
      .when('/users', {
        templateUrl: 'app/views/users/list.html',
        controller: 'UserListController',
        title: 'FlightNode - Users - List'
      })
      .when('/users/pending', {
        templateUrl: 'app/views/users/pending.html',
        controller: 'UserPendingController',
        title: 'FlightNode - Pending Users'
      })
      .when('/users/new', {
        templateUrl: 'app/views/users/create.html',
        controller: 'UserCreateController',
        title: 'FlightNode - Users - New'
      })
      .when('/users/register', {
        templateUrl: 'app/views/users/register.html',
        controller: 'UserRegisterController',
        title: 'FlightNode - Register New Account'
      })
      .when('/users/profile', {
        templateUrl: 'app/views/users/profile.html',
        controller: 'UserProfileController',
        title: 'FlightNode - My Profile'
      })
      .when('/users/:userId', {
        templateUrl: 'app/views/users/edit.html',
        controller: 'UserEditController',
        title: 'FlightNode - Users - Edit'
      })
      .when('/workdays/', {
        templateUrl: 'app/views/workdays/list.html',
        controller: 'WorkdayListController',
        title: 'FlightNode - Work Day - List'
      })
      .when('/workdays/new', {
        templateUrl: 'app/views/workdays/create.html',
        controller: 'WorkdayCreateController',
        title: 'FlightNode - Work Day - New Log'
      })
      .when('/workdays/newforuser', {
        templateUrl: 'app/views/workdays/createForUser.html',
        controller: 'WorkdayCreateForUserController',
        title: 'FlightNode - Work Day - New Log for Another Person'
      })
      .when('/workdays/mylist', {
        templateUrl: 'app/views/workdays/mylist.html',
        controller: 'WorkdayMyListController',
        title: 'FlightNode - User\'s Work Days'
      })
      .when('/workdays/:id', {
        templateUrl: 'app/views/workdays/edit.html',
        controller: 'WorkdayEditController',
        title: 'FlightNode - Work Day - Edit'
      })
      .when('/worktypes', {
        templateUrl: 'app/views/worktypes/list.html',
        controller: 'WorktypeListController',
        title: 'FlightNode - Work Types - List'
      })
      .when('/worktypes/new', {
        templateUrl: 'app/views/worktypes/create.html',
        controller: 'WorktypeCreateController',
        title: 'FlightNode - Work Types - New'
      })
      .when('/worktypes/:id', {
        templateUrl: 'app/views/worktypes/edit.html',
        controller: 'WorktypeEditController',
        title: 'FlightNode - FlightNode - Work Types - Edit'
      })
      .when('/locations', {
        templateUrl: 'app/views/locations/list.html',
        controller: 'LocationListController',
        title: 'FlightNode - Locations - List'
      })
      .when('/locations/new', {
        templateUrl: 'app/views/locations/create.html',
        controller: 'LocationCreateController',
        title: 'FlightNode - Locations - New'
      })
      .when('/locations/:id', {
        templateUrl: 'app/views/locations/edit.html',
        controller: 'LocationEditController',
        title: 'FlightNode - Locations - Edit'
      })
      .when('/species', {
        templateUrl: 'app/views/birdspecies/list.html',
        controller: 'BirdSpeciesListController',
        title: 'FlightNode - Bird Species - List'
      })
      .when('/species/new', {
        templateUrl: 'app/views/birdspecies/create.html',
        controller: 'BirdSpeciesCreateController',
        title: 'FlightNode - Bird Species - New'
      })
      .when('/species/:id', {
        templateUrl: 'app/views/birdspecies/edit.html',
        controller: 'BirdSpeciesEditController',
        title: 'FlightNode - Bird Species - Edit'
      })
      .when('/logout', {
        templateUrl: 'app/views/main.html',
        controller: 'LogoutController'
      })
      .when('/censusdata/', {
        templateUrl: 'app/views/censusdata/create.html',
        controller: 'CensusDataCreateController',
        title: 'FlightNode - Census Data - New'
      })
      .when('/censusdata/create', {
        templateUrl: 'app/views/censusdata/create.html',
        //TODO: Will think about should conroller be seperated out for each of these views.
        controller: 'CensusDataCreateController',
        title: 'FlightNode - Census Data - New'
      })
      .when('/censusdata/create2', {
        templateUrl: 'app/views/censusdata/create2.html',
        //TODO: Will think about should conroller be seperated out for each of these views.
        controller: 'CensusDataCreateController',
        title: 'FlightNode - Census Data - New'
      })
      .when('/censusdata/create3', {
        templateUrl: 'app/views/censusdata/create3.html',
        //TODO: Will think about should conroller be seperated out for each of these views.
        controller: 'CensusDataCreateController',
        title: 'FlightNode - Census Data - New'
      })
      .otherwise({
        templateUrl: 'app/views/404.html',
        title: 'FlightNode - page not found'
      });
  })
  .run(function(authService, $rootScope, $route, $window, $log, navigationService) {
    var display = authService.getDisplayName();
    if (display) {
      $rootScope.display_name = 'Welcome, ' + display;
    }

    $rootScope.$on('$routeChangeSuccess', function() {
      $window.document.title = ($route.current.title || '');
    });

    navigationService.buildNavigation();

  })
  .directive('loading', function () {
    return {
      restrict: 'E',
      replace: true,
      template: '<div class="loading"><img class="loadingImage" src="http://www.nasa.gov/multimedia/videogallery/ajax-loader.gif" width="64" height="64" /></div>',
      link: function (scope, element) {
        scope.$watch('loading', function (val) {
          if (val) {
            $(element).show();
          }
          else {
            $(element).hide();
          }
        });
      }
    };
  })
  .directive('alert', [function () {
    return {
      restrict: 'E',
      replace: true,
      templateUrl: 'app/views/alert.html'
    };
  }])
  .directive('date', function () {
    return {
      require: 'ngModel',
      link: function (scope, elm, attrs, ctrl) {
        ctrl.$validators.date = function (modelValue, viewValue) {
          if (ctrl.$isEmpty(modelValue)) {
            // consider empty models to be valid
            return true;
          }

          if ((new Date(viewValue))) {
            // it is valid
            return true;
          }

          // it is invalid
          return false;
        };
      }
    };
  })
  .directive('time', function () {
    return {
      require: 'ngModel',
      link: function (scope, elm, attrs, ctrl) {
        ctrl.$validators.time = function (modelValue, viewValue) {
          if (ctrl.$isEmpty(modelValue)) {
            // consider empty models to be valid
            return true;
          }

          if ((new Date('2015-10-29 ' + viewValue))) {
            // it is valid
            return true;
          }

          // it is invalid
          return false;
        };
      }
    };
  })
  .filter('htmlEncode', function(){
    return window.encodeURIComponent;
  });