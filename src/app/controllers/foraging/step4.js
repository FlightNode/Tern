'use strict';

/**
 * @ngdoc function
 * @name flightNodeApp.controller:ForagingStep4Controller
 * @description
 * # ForagingStep4Controller
 * Controller for rookery foraging census form, step 4.
 */
angular.module('flightNodeApp')
    .controller('ForagingStep4Controller', ['$scope', 'authService', 'config', 'messenger',
        'foragingSurveyProxy', '$filter', '$location', '$log', 'locationProxy', 'enumsProxy',
        '$route', '$uibModal', 'birdsProxy', '$routeParams',
        function($scope, authService, config, messenger,
            foragingSurveyProxy, $filter, $location, $log, locationProxy, enumsProxy,
            $route, $uibModal, birdsProxy, $routeParams) {


            if (!(authService.isReporter())) {
                $log.warn('not authorized to access this path');
                $location.path('/');
                return;
            }

            $scope.loading = true;

       

            $scope.loading = false;
        }
    ]);
