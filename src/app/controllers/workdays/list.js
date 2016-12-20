'use strict';



/**
 * @ngdoc function
 * @name flightNodeApp.controller:WorkdayListController
 * @description
 * # WorkdayListController
 * Controller for the user list page.
 */
angular.module('flightNodeApp')
    .controller('WorkdayListController', ['$scope', '$http', '$log', 'messenger', '$location', 'authService', 'config',
        function($scope, $http, $log, messenger, $location, authService, config) {

            if (!authService.isAdministrator()) {
                $log.warn('not authorized to access this path');
                $location.path('/');
                return;
            }

            //
            // Helper functions
            //

            // TODO move this to a proxy service
            var retrieveRecords = function() {
                $scope.loading = true;

                authService.get(config.exportWorkLogs)
                    .then(function success(response) {
                        $scope.list = response.data;

                        $scope.loading = false;

                    }, function error(response) {
                        messenger.displayErrorResponse($scope, response);
                        $scope.loading = false;
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
                $location.path('/workdays/newforuser');
            };

            $scope.editWorkDay = function(id) {
                $location.path('/workdays/edit/' + id);
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
                    { name: 'workDate', display: 'Date' },
                    { name: 'county', displayName: 'County' },
                    { name: 'siteName', displayName: 'Site Name' },
                    { name: 'numberOfVolunteers', displayName: '# Volunteers' },
                    { name: 'workHours', displayName: 'Work Hours' },
                    { name: 'travelTimeHours', displayName: 'Travel Hours' },
                    { name: 'volunteer', displayName: 'Volunteer' }, {
                        name: 'id',
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
