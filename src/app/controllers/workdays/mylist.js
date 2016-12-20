'use strict';

/**
 * @ngdoc function
 * @name flightNodeApp.controller:WorkdayMyListController
 * @description
 * # WorkdayMyListController
 * Controller for the user list page.
 */
angular.module('flightNodeApp')
    .controller('WorkdayMyListController', ['$scope', '$http', '$log', 'messenger', '$location', 'authService', 'config',
        function($scope, $http, $log, messenger, $location, authService, config) {

            if (!authService.isAuthorized()) {
                $location.path('/login').search('redirect', '/workdays/mylist');
                return;
            }



            //
            // Helper functions
            //

            // TODO move this to a proxy service
            var retrieveRecords = function() {

                $scope.loading = true;
                
                authService.get(config.workLogsForUser)
                    .then(function success(response) {
                        $scope.list = response.data;

                        $scope.loading = false;

                    }, function error(response) {
                        $scope.loading = false;
                        messenger.displayErrorResponse($scope, response);
                        return null;
                    });
            };

            //
            // Configure actions
            //

            $scope.exportData = function() {
                return $scope.list;
            };


            $scope.createWorkDay = function() {
                $location.path('/workdays/new');
            };

            $scope.editWorkDay = function(id) {
                $location.path('/workdays/' + id);
            };

            $scope.getHeader = function() {
                return ['Id', 'WorkDate', 'Activity', 'County', 'SiteName', 'NumberOfVolunteers', 'WorkHours', 'TravelTimeHours', 'Volunteer', 'TasksCompleted', 'UserId'];
            };

            //
            // Main program flow
            //

            $scope.list = [];

            $scope.gridOptions = {
                enableFiltering: true,
                rowTemplate: 'app/views/row.html',
                onRegisterApi: function(gridApi) {
                    $scope.gridApi = gridApi;
                },
                data: 'list',
                columnDefs: [
                    { field: 'workDate', display: 'Date' },
                    { name: 'county', displayName: 'County' },
                    { name: 'siteName', displayName: 'Site Name' },
                    { name: 'numberOfVolunteers', displayName: '# Volunteers' },
                    { name: 'workHours', displayName: 'Work Hours' },
                    { name: 'travelTimeHours', displayName: 'Travel Hours' }, {
                        field: 'id',
                        displayName: '',
                        cellTemplate: '\
                        <div class="ui-grid-cell-contents" title="Edit">\
                          <button class="btn btn-primary btn-xs" ng-click="grid.appScope.editWorkDay(row.entity.id)" \
                           aria-label="edit">\
                              <span class="glyphicon glyphicon-pencil" aria-hidden="true"></span>\
                          </button>\
                        </div>',
                        enableFiltering: false,
                        width: '32',
                        enableColumnMenu: false
                    }
                ]
            };

            retrieveRecords();
        }
    ]);
