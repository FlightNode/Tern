'use strict';

flnd.workDayList = {
    retrieveRecords: function(config, $scope, messenger, authService) {
        $scope.list = [];

        authService.get(config.exportWorkLogs)
            .then(function success(response) {
                $scope.list = response.data;

                $scope.loading = false;

            }, function error(response) {
                messenger.displayErrorResponse($scope, response);
                $scope.loading = false;
                return null;
            });
    }
};

/**
 * @ngdoc function
 * @name flightNodeApp.controller:WorkdayListController
 * @description
 * # WorkdayListController
 * Controller for the user list page.
 */
angular.module('flightNodeApp')
    .controller('WorkdayListController',
     ['$scope', '$http', '$log', 'messenger', '$location', 'authService', 'config','$uibModal',
        function ($scope, $http, $log, messenger, $location, authService, config, $uibModal) {

            if (!(authService.isAdministrator() ||
                  authService.isCoordinator())) {
                $log.warn('not authorized to access this path');
                $location.path('/');
                return;
            }

            $scope.loading = true;

            flnd.workDayList.retrieveRecords(config, $scope, messenger, authService);

            $scope.gridOptions = {
                enableFiltering: true,
                rowTemplate: 'app/views/row.html',
                onRegisterApi: function (gridApi) {
                    $scope.gridApi = gridApi;
                },
                data: 'list',
                columnDefs: [
                    { name: 'workDate', display: 'Date' },
                    { name: 'county', displayName: 'County'},
                    { name: 'siteName', displayName: 'Site Name' },
                    { name: 'numberOfVolunteers', displayName: '# Volunteers'},
                    { name: 'workHours', displayName: 'Work Hours' },
                    { name: 'travelTimeHours', displayName: 'Travel Hours' },
                    { name: 'volunteer', displayName: 'Volunteer' },
                    {
                        name: 'id',
                        displayName: '',
                        cellTemplate: '\
                        <div class="ui-grid-cell-contents" title="Edit">\
                          <button class="btn btn-primary btn-xs" ng-click="grid.appScope.editWorkDay(row.entity.id)" \
                           aria-label="edit">\
                              <span class="glyphicon glyphicon-pencil" aria-hidden="true"></span>\
                          </button>\
                        </div>',
                        //cellTemplate: '<div class="ui-grid-cell-contents" title="Edit"><a ng-href="/#/workdays/{{row.entity.id}}?p={{row.entity.person | htmlEncode}}">Edit</a></div>',
                        enableFiltering: false,
                        width: '32',
                        enableColumnMenu: false
                    }
                ]
            };


            $scope.exportData = function() {
                return $scope.list;
            };

            var success = function() {
                // Re-load the grid
                flnd.workDayList.retrieveRecords(config, $scope, messenger, authService);
                messenger.showSuccessMessage($scope, 'Saved');
            };

            var dismissed = function() {
                // no action required
            };

            $scope.createWorkDay = function () {
                var modal = $uibModal.open({
                    animation: true,
                    templateUrl: '/app/views/workdays/createForUser.html',
                    controller: 'WorkdayCreateForUserController',
                    size: 'lg'
                });
                modal.result.then(success, dismissed);
            };

            $scope.editWorkDay = function(id) {
                var modal = $uibModal.open({
                    animation: true,
                    templateUrl: '/app/views/workdays/edit.html',
                    controller: 'WorkdayEditController',
                    size: 'lg',
                    resolve: {
                        id: function() {
                            return id;
                        }
                    }
                });
                modal.result.then(success, dismissed);
            };

            $scope.getHeader = function() {
                return [ 'Id', 'WorkDate', 'Activity', 'County', 'SiteName', 'NumberOfVolunteers', 'WorkHours', 'TravelTimeHours', 'Volunteer', 'TasksCompleted', 'UserId' ];
            };

        }]);