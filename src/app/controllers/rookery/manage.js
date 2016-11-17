'use strict';

/**
 * @ngdoc function
 * @name flightNodeApp.controller:RookeryCensusManageController
 * @description
 * # RookeryCensusManageController
 * Controller for the managing Rookery Census data
 */
angular.module('flightNodeApp')
    .controller('RookeryCensusManageController', ['$scope', 'authService', 'config', 'messenger',
        'rookeryCensusProxy', '$filter', '$location', '$log', 'locationProxy', 'enumsProxy',
        '$route', '$uibModal', 'uiGridConstants',
        function($scope, authService, config, messenger,
            rookeryCensusProxy, $filter, $location, $log, locationProxy, enumsProxy,
            $route, $uibModal, uiGridConstants) {


            if (!(authService.isAdministrator())) {
                $log.warn('not authorized to access this path');
                $location.path('/');
                return;
            }

            $scope.loading = true;

            rookeryCensusProxy.getFullList($scope, function(data) {
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
                            searchTerm = searchTerm.replace(/\\/g, '') + 'T00:00:00';
                            var st = new Date(searchTerm).toDateString();
                            var cv = new Date(cellValue).toDateString();
                            return st === cv;
                        }
                    }
                }, {
                    field: 'submittedBy',
                    displayName: 'Submitted By',
                    filter: {
                        placeholder: 'contains'
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

            $scope.downloadRookeryData = function() {
                return rookeryCensusProxy.export();
            };

            $scope.getHeader = function() {
                return ['id',
                    'surveyIdentifier',
                    'siteCode',
                    'siteName',
                    'city',
                    'county',
                    'longitude',
                    'latitude',
                    'assessment',
                    'startDate',
                    'endDate',
                    'vantagePoint',
                    'accessPoint',
                    'submittedBy',
                    'observers',
                    'generalComments',
                    'genus',
                    'species',
                    'commonAlphaCode',
                    'commonName',
                    'numberOfAdults',
                    'nestsPresent',
                    'fledglingsPresent',
                    'disturbanceComments',
                    'kayakerQuantity',
                    'kayakerDurationMinutes',
                    'kayakResult',
                    'fishermenWadingQuantity',
                    'fishermenWadingDurationMinutes',
                    'fishermenWadingResult',
                    'stationaryBoatsQuantity',
                    'stationaryBoatsDurationMinutes',
                    'stationaryBoatsResult',
                    'movingBoatsQuantity',
                    'movingBoatsDurationMinutes',
                    'movingBoatsResult',
                    'personalWatercraftQuantity',
                    'personalWatercraftDurationMinutes',
                    'humansQuantity',
                    'humansMinutes',
                    'humansResult',
                    'noiseQuantity',
                    'noiseMinutes',
                    'noiseResult',
                    'otherDisturbanceQuantity',
                    'otherDisturbanceMinutes',
                    'otherDisturbanceResult'
                ];
            };

            $scope.editSurvey = function(id) {
                $location.path('/rookery/step1/' + id);
            };

            $scope.loading = false;
        }
    ]);
