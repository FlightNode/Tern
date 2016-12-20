'use strict';

/**
 * @ngdoc function
 * @name flightNodeApp.controller:ForagingListController
 * @description
 * # ForagingListController
 * Controller for the listing a user's Waterbird Foraging Survey data
 */
angular.module('flightNodeApp')
    .controller('ForagingListController', ['$scope', 'authService', 'config', 'messenger',
        'foragingSurveyProxy', '$filter', '$location', '$log', 'locationProxy', 'enumsProxy',
        '$route', '$uibModal', 'uiGridConstants',
        function($scope, authService, config, messenger,
            foragingSurveyProxy, $filter, $location, $log, locationProxy, enumsProxy,
            $route, $uibModal, uiGridConstants) {


            if (!(authService.isAuthorized())) {
                $log.warn('not authorized to access this path');
                $location.path('/');
                return;
            }

            $scope.loading = true;

            var loadData = function(next) {
                foragingSurveyProxy.getForCurrentUser($scope, function(data) {
                    $scope.list = data;
                    if (_.isFunction(next)) {
                        next();
                    }
                });
            };


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
                          <button class="btn btn-default btn-xs" ng-click="grid.appScope.editSurvey(row.entity.surveyIdentifier)" \
                           aria-label="edit">\
                              <span class="glyphicon glyphicon-pencil" aria-hidden="true" title="Edit"></span>\
                          </button>\
                          <button ng-if="row.entity.status===\'Pending\'" class="btn btn-default btn-xs" \
                             ng-click="grid.appScope.deleteSurvey({surveyIdentifier:row.entity.surveyIdentifier, siteCode: row.entity.siteCode, siteName: row.entity.siteName, startDate: row.entity.startDate })" \
                           aria-label="delete">\
                              <span class="glyphicon glyphicon-remove" aria-hidden="true" title="Delete"></span>\
                          </button>\
                        </div>',
                    enableFiltering: false,
                    width: '64',
                    enableColumnMenu: false
                }]
            };

            $scope.newSurvey = function() {
                $location.path('/foraging/step1/');
            };

            $scope.editSurvey = function(id) {
                $location.path('/foraging/step1/' + id);
            };

            $scope.deleteSurvey = function(options) {

                var modal = $uibModal.open({
                    animation: true,
                    templateUrl: 'confirmDelete',
                    backdrop: true,
                    size: 'sm',
                    controllerAs: '$ctrl',
                    controller: function() {
                        var $ctrl = this;
                        $ctrl.survey = options;
                    }
                });
                modal.result.then(function success() {
                    foragingSurveyProxy.delete($scope, options.surveyIdentifier)
                        .then(function() {
                            loadData($scope.gridApi.core.refreshRows);
                        });

                }, function dismissed() {
                    // do nothing
                });
            };


            loadData();

            $scope.loading = false;
        }
    ]);
