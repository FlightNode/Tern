'use strict';

/**
 * @ngdoc function
 * @name flightNodeApp.controller:RookeryListController
 * @description
 * # RookeryListController
 * Controller for the listing a user's Rookery Census Survey data
 */
angular.module('flightNodeApp')
    .controller('RookeryListController', ['$scope', 'authService', 'config', 'messenger',
        'rookeryCensusProxy', '$filter', '$location', '$log', 'locationProxy', 'enumsProxy',
        '$route', '$uibModal', 'uiGridConstants',
        function($scope, authService, config, messenger,
            rookeryCensusProxy, $filter, $location, $log, locationProxy, enumsProxy,
            $route, $uibModal, uiGridConstants) {


            if (!(authService.isAuthorized())) {
                $log.warn('not authorized to access this path');
                $location.path('/');
                return;
            }

            $scope.loading = true;

            rookeryCensusProxy.getForCurrentUser($scope, function(data) {
                $scope.list = data;
            });


            $scope.gridOptions = {
                enableFiltering: true,
                rowTemplate: 'app/views/row.html',
                onRegisterApi: function(gridApi) {
                    $scope.gridApi = gridApi;
                },
                data: 'list',
                columnDefs: [{
                    field: 'siteCode',
                    displayName: 'Site Code',
                    filter: {
                        placeholder: 'contains'
                    }
                }, {
                    field: 'siteName',
                    displayName: 'Site Name',
                    filter: {
                        placeholder: 'contains'
                    }
                }, {
                    field: 'startDate',
                    displayName: 'Start Date',
                    cellFilter: 'date:"yyyy-MM-dd HH:mm"',
                    filterCellFiltered: true,
                    filter: {
                        placeholder: 'equals',
                        condition: function(searchTerm, cellValue) {
                            searchTerm = searchTerm.replace(/\\/g, '') + "T00:00:00";
                            var st = new Date(searchTerm).toDateString();
                            var cv = new Date(cellValue).toDateString();
                            return st === cv;
                        }
                    }
                }, {
                    field: 'status',
                    displayName: 'Status',
                    filter: {
                        type: uiGridConstants.filter.SELECT,
                        selectOptions: [
                            { value: 'Pending', label: 'Pending' },
                            { value: 'Complete', label: 'Complete' }
                        ]
                    }
                }, {
                    visible: true,
                    field: 'surveyIdentifier',
                    displayName: '',
                    cellTemplate: '\
                        <div class="ui-grid-cell-contents" title="Edit">\
                          <button class="btn btn-primary btn-xs" ng-click="grid.appScope.editSurvey(row.entity.surveyIdentifier)" \
                           aria-label="edit">\
                              <span class="glyphicon glyphicon-pencil" aria-hidden="true"></span>\
                          </button>\
                        </div>',
                    enableFiltering: false,
                    width: '32',
                    enableColumnMenu: false
                }]
            };

            $scope.newSurvey = function() {
                $location.path('/rookery/step1/');
            }

            $scope.editSurvey = function(id) {
                $location.path('/rookery/step1/' + id);
            };

            $scope.loading = false;
        }
    ]);
