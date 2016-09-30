'use strict';

flnd.workTypeList = {
    retrieveRecord: function(config, $scope, messenger, authService) {
        $scope.list = [];

        authService.get(config.workTypes)
            .then(function success(response) {

                $scope.list = response.data;

            }, function error(response) {
                messenger.displayErrorResponse($scope, response);
            });
    }
};

/**
 * @ngdoc function
 * @name flightNodeApp.controller:WorktypeListController
 * @description
 * # WorktypeListController
 * Controller for the user list page.
 */
angular.module('flightNodeApp')
    .controller('WorktypeListController', ['$scope', '$http', '$log', 'messenger', '$location', 'authService', 'config', '$uibModal',
        function($scope, $http, $log, messenger, $location, authService, config, $uibModal) {

            if (!authService.isAdministrator()) {
                $log.warn('not authorized to access this path');
                $location.path('/');
                return;
            }

            $scope.loading = true;

            flnd.workTypeList.retrieveRecord(config, $scope, messenger, authService);

            $scope.gridOptions = {
                enableFiltering: true,
                rowTemplate: 'app/views/row.html',
                onRegisterApi: function(gridApi) {
                    $scope.gridApi = gridApi;
                },
                data: 'list',
                columnDefs: [
                    { name: 'description', displayName: 'Description' }, {
                        field: 'id',
                        displayName: '',
                        cellTemplate: '\
                        <div class="ui-grid-cell-contents" title="Edit">\
                          <button class="btn btn-primary btn-xs" ng-click="grid.appScope.editWorkType(row.entity.id)" \
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

            var success = function() {
                // Re-load the grid
                flnd.workTypeList.retrieveRecord(config, $scope, messenger, authService);
                messenger.showSuccessMessage($scope, 'Saved');
            };

            var dismissed = function() {
                // no action required
            };

            $scope.creatWorkType = function() {
                var modal = $uibModal.open({
                    animation: true,
                    templateUrl: '/app/views/worktypes/create.html',
                    controller: 'WorktypeCreateController',
                    size: 'lg'
                });
                modal.result.then(success, dismissed);
            };

            $scope.editWorkType = function(id) {
                var modal = $uibModal.open({
                    animation: true,
                    templateUrl: '/app/views/worktypes/edit.html',
                    controller: 'WorktypeEditController',
                    size: 'lg',
                    resolve: {
                        id: function() {
                            return id;
                        }
                    }
                });
                modal.result.then(success, dismissed);
            };

            $scope.loading = false;

        }
    ]);
