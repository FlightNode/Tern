'use strict';

var flnd = {}; // jshint ignore:line
var site = 'Audubon TERN';

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
    'ui.grid.selection'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'app/views/main.html',
        controller: 'MainController',
        title: site + ' - Home'
      })
      .when('/login', {
        templateUrl: 'app/views/login.html',
        controller: 'LoginController',
        title: site + ' - Login'
      })
      .when('/users', {
        templateUrl: 'app/views/users/list.html',
        controller: 'UserListController',
        title: site + ' - Users - List'
      })
      .when('/users/pending', {
        templateUrl: 'app/views/users/pending.html',
        controller: 'UserPendingController',
        title: site + ' - Pending Users'
      })
      .when('/users/new', {
        templateUrl: 'app/views/users/create.html',
        controller: 'UserCreateController',
        title: site + ' - Users - New'
      })
      .when('/users/register', {
        templateUrl: 'app/views/users/register.html',
        controller: 'UserRegisterController',
        title: site + ' - Register New Account'
      })
      .when('/users/profile', {
        templateUrl: 'app/views/users/profile.html',
        controller: 'UserProfileController',
        title: site + ' - My Profile'
      })
      .when('/users/:userId', {
        templateUrl: 'app/views/users/edit.html',
        controller: 'UserEditController',
        title: site + ' - Users - Edit'
      })
      .when('/workdays/all', {
        templateUrl: 'app/views/workdays/list.html',
        controller: 'WorkdayListController',
        title: site + ' - Work Day - List'
      })
      .when('/workdays/new', {
        templateUrl: 'app/views/workdays/create.html',
        controller: 'WorkdayCreateController',
        title: site + ' - Work Day - New Log'
      })
      .when('/workdays/newforuser', {
        templateUrl: 'app/views/workdays/createForUser.html',
        controller: 'WorkdayCreateForUserController',
        title: site + ' - Work Day - New Log for Another Person'
      })
      .when('/workdays/', {
        templateUrl: 'app/views/workdays/mylist.html',
        controller: 'WorkdayMyListController',
        title: site + ' - User\'s Work Days'
      })
      .when('/workdays/mylist', {
        templateUrl: 'app/views/workdays/mylist.html',
        controller: 'WorkdayMyListController',
        title: site + ' - User\'s Work Days'
      })
      .when('/workdays/:id', {
        templateUrl: 'app/views/workdays/edit.html',
        controller: 'WorkdayEditController',
        title: site + ' - Work Day - Edit'
      })
      .when('/worktypes', {
        templateUrl: 'app/views/worktypes/list.html',
        controller: 'WorktypeListController',
        title: site + ' - Work Types - List'
      })
      .when('/worktypes/new', {
        templateUrl: 'app/views/worktypes/create.html',
        controller: 'WorktypeCreateController',
        title: site + ' - Work Types - New'
      })
      .when('/worktypes/:id', {
        templateUrl: 'app/views/worktypes/edit.html',
        controller: 'WorktypeEditController',
        title: site + ' - FlightNode - Work Types - Edit'
      })
      .when('/locations', {
        templateUrl: 'app/views/locations/list.html',
        controller: 'LocationListController',
        title: site + ' - Locations - List'
      })
      .when('/locations/new', {
        templateUrl: 'app/views/locations/create.html',
        controller: 'LocationCreateController',
        title: site + ' - Locations - New'
      })
      .when('/locations/:id', {
        templateUrl: 'app/views/locations/edit.html',
        controller: 'LocationEditController',
        title: site + ' - Locations - Edit'
      })
      .when('/species', {
        templateUrl: 'app/views/birdspecies/list.html',
        controller: 'BirdSpeciesListController',
        title: site + ' - Bird Species - List'
      })
      .when('/species/new', {
        templateUrl: 'app/views/birdspecies/create.html',
        controller: 'BirdSpeciesCreateController',
        title: site + ' - Bird Species - New'
      })
      .when('/species/:id', {
        templateUrl: 'app/views/birdspecies/edit.html',
        controller: 'BirdSpeciesEditController',
        title: site + ' - Bird Species - Edit'
      })
      .when('/logout', {
        templateUrl: 'app/views/main.html',
        controller: 'LogoutController'
      })
      .when('/foraging/', {
        redirectTo: '/foraging/create1'
      })
      .when('/foraging/create1', {
        templateUrl: 'app/views/foraging/create1.html',
        controller: 'ForagingCreateController',
        title: site + ' - Waterbird Foraging Survey - New',
        step: 1
      })
      .when('/foraging/create2', {
        templateUrl: 'app/views/foraging/create2.html',
        controller: 'ForagingCreateController',
        title: site + ' - Waterbird Foraging Survey - New',
        step: 2
      })
      .when('/foraging/create3', {
        templateUrl: 'app/views/foraging/create3.html',
        controller: 'ForagingCreateController',
        title: site + ' - Waterbird Foraging Survey - New',
        step: 3
      })
      .when('/foraging/create4', {
        templateUrl: 'app/views/foraging/create4.html',
        controller: 'ForagingCreateController',
        title: site + ' - Waterbird Foraging Survey - New',
        step: 4
      })
      .when('/violations', {
        templateUrl: 'app/views/violations.html',
        title:  site + ' - Reporting Violations'
      })
      .when('/faq', {
        templateUrl: 'app/views/faq/index.html',
        title: site + ' - Frequently Asked Questions'
      })
      .when('/contact', {
        templateUrl: 'app/views/contact.html',
        title: site + ' - Contact Us'
      })
      .when('/data', {
        templateUrl: 'app/views/data.html',
        title: site + ' - Submit Survey Data'
      })
      .when('/data2', {
        templateUrl: 'app/views/data2.html',
        title: site + ' - Submit Survey Data'
      })
      .when('/foraging/create4', {
        templateUrl: 'app/views/foraging/create4.html',
        //TODO: Will think about should conroller be separated out for each of these views.
        controller: 'foragingCreateController',
        title: 'FlightNode - Waterbird Foraging Survey - Finished'
      })
      .otherwise({
        templateUrl: 'app/views/404.html',
        title: site + ' - page not found'
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