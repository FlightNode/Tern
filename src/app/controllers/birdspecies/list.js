'use strict';

/**
 * @ngdoc function
 * @name flightNodeApp.controller:BirdSpeciesListController
 * @description
 * # BirdSpeciesListController
 * Controller for the user list page.
 */
angular.module('flightNodeApp')
    .controller('BirdSpeciesListController', ['$scope', '$http', '$log', 'messenger', '$location', 'authService', 'config',
        '$uibModal', 'birdsProxy',
        function($scope, $http, $log, messenger, $location, authService, config,
            $uibModal, birdsProxy) {

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

            var retrieveAllRecords = function() {
                birdsProxy.getAll($scope, function(data) { $scope.list = data });
            };
            retrieveAllRecords();

            $scope.gridOptions = {
                enableFiltering: true,
                rowTemplate: 'app/views/row.html',
                onRegisterApi: function(gridApi) {
                    $scope.gridApi = gridApi;
                },
                data: 'list',
                columnDefs: [
                    { field: 'order', displayName: 'Order' },
                    { field: 'family', displayName: 'Family' },
                    { field: 'subFamily', displayName: 'Sub Family' },
                    { field: 'genus', displayName: 'Genus' },
                    { field: 'species', displayName: 'Species' }, {
                        field: 'commonName',
                        displayName: 'Common Name',
                        width: '200',
                    }, {
                        field: 'id',
                        displayName: '',
                        cellTemplate: '\
                        <div class="ui-grid-cell-contents" title="Edit">\
                          <button class="btn btn-primary btn-xs" ng-click="grid.appScope.editBirdSpecies(row.entity.id)" \
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
                retrieveAllRecords();
                messenger.showSuccessMessage($scope, 'Saved');
            };

            var dismissed = function() {
                // no action required
            };

            $scope.createBirdSpecies = function() {
                var modal = $uibModal.open({
                    animation: true,
                    templateUrl: '/app/views/birdspecies/create.html',
                    controller: 'BirdSpeciesCreateController',
                    size: 'lg'
                });
                modal.result.then(success, dismissed);
            };

            $scope.editBirdSpecies = function(id) {
                var modal = $uibModal.open({
                    animation: true,
                    templateUrl: '/app/views/birdspecies/edit.html',
                    controller: 'BirdSpeciesEditController',
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
