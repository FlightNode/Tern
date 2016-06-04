'use strict';

/**
 * @ngdoc function
 * @name flightNodeApp.controller:LocationListController
 * @description
 * # LocationListController
 * Controller for the user list page.
 */
angular.module('flightNodeApp')
    .controller('LocationListController', ['$scope', '$http', '$log', 'messenger', '$location', 'authService', 'config', '$uibModal', 'locationProxy',
        function($scope, $http, $log, messenger, $location, authService, config, $uibModal, locationProxy) {

            // TODO: when not authorized, an error about uiGrid will
            // appear on the screen, probably because it tries to load
            //  the view before changing the location path. Is there a
            //  better place to put this? Perhaps something in the routing
            //  to intercept the route and direct traffic by permission?
            if (!(authService.isAdministrator() ||
                    authService.isCoordinator())) {
                $log.warn('not authorized to access this path');
                $location.path('/');
                return;
            }

            $scope.loading = true;

            locationProxy.get($scope, function(data) {
                $scope.list = data;
            });

            $scope.gridOptions = {
                enableFiltering: true,
                rowTemplate: 'app/views/row.html',
                onRegisterApi: function(gridApi) {
                    $scope.gridApi = gridApi;
                },
                data: 'list',
                columnDefs: [
                    { field: 'siteCode', displayName: 'Site Code' },
                    { field: 'siteName', displayName: 'Site Name' },
                    { field: 'county', displayName: 'County' },
                    { field: 'city', displayName: 'City' },
                    { field: 'latitude', displayName: 'Latitude' },
                    { field: 'longitude', displayName: 'Longitude' }, {
                        field: 'id',
                        displayName: '',
                        cellTemplate: '\
                        <div class="ui-grid-cell-contents" title="Edit">\
                          <button class="btn btn-primary btn-xs" ng-click="grid.appScope.editLocation(row.entity.id)" \
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
                flnd.locationList.retrieveRecords(config, $scope, messenger, authService);
                messenger.showSuccessMessage($scope, 'Saved');
            };

            var dismissed = function() {
                // no action required
            };

            $scope.createLocation = function() {
                var modal = $uibModal.open({
                    animation: true,
                    templateUrl: '/app/views/locations/create.html',
                    controller: 'LocationCreateController',
                    size: 'lg'
                });
                modal.result.then(success, dismissed);
            };

            $scope.editLocation = function(id) {
                var modal = $uibModal.open({
                    animation: true,
                    templateUrl: '/app/views/locations/edit.html',
                    controller: 'LocationEditController',
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
