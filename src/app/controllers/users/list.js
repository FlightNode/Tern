'use strict';

flnd.userList = {
    retrieve: function(authService, config, $scope, messenger) {
        authService.get(config.users)
            .then(function success(response) {

                $scope.userList = _.map(response.data, function(user) {
                    return {
                        fullName: user.givenName + ' ' + user.familyName,
                        email: user.email,
                        phone: user.primaryPhoneNumber,
                        id: user.userId
                    };
                });

            }, function error(response) {

                messenger.displayErrorResponse($scope, response);
            });
    }
};

/**
 * @ngdoc function
 * @name flightNodeApp.controller:UserListController
 * @description
 * # UserListController
 * Controller for the user list page.
 */
angular.module('flightNodeApp')
    .controller('UserListController', ['$scope', '$http', '$log', 'messenger', '$location', 'authService', 'config', '$uibModal',
        function($scope, $http, $log, messenger, $location, authService, config, $uibModal) {


            if (!authService.isAdministrator()) {
                $log.warn('not authorized to access this path');
                $location.path('/');
                return;
            }

            $scope.loading = true;

            $scope.userList = [];

            flnd.userList.retrieve(authService, config, $scope, messenger);

            $scope.gridOptions = {
                enableFiltering: true,
                rowTemplate: 'app/views/row.html',
                onRegisterApi: function(gridApi) {
                    $scope.gridApi = gridApi;
                },
                data: 'userList',
                columnDefs: [
                    { field: 'fullName', displayName: 'Full Name' }, {
                        field: 'email',
                        displayName: 'E-mail Address',
                        cellTemplate: '\
                        <div class="ui-grid-cell-contents" title="Edit">\
                          <a href="mailto:{{row.entity.email}}">{{row.entity.email}}</a> \
                        </div>',
                    },
                    { field: 'phone', displayName: 'Phone Number' }, {
                        field: 'id',
                        displayName: '',
                        cellTemplate: '\
                        <div class="ui-grid-cell-contents" title="Edit">\
                          <button class="btn btn-primary btn-xs" ng-click="grid.appScope.editUser(row.entity.id)" \
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

            $scope.createUser = function() {
                var modal = $uibModal.open({
                    animation: true,
                    templateUrl: '/app/views/users/create.html',
                    controller: 'UserCreateController',
                    size: 'lg'
                });
                modal.result.then(function ok() {
                    // Re-load the grid
                    flnd.userList.retrieve(authService, config, $scope, messenger);
                    messenger.showSuccessMessage($scope, 'Saved');
                }, function dismissed() {
                    // no action required
                });
            };

            $scope.editUser = function(id) {
                var modal = $uibModal.open({
                    animation: true,
                    templateUrl: '/app/views/users/edit.html',
                    controller: 'UserEditController',
                    size: 'lg',
                    resolve: {
                        id: function() {
                            return id;
                        }
                    }
                });
                modal.result.then(function ok() {
                    // Re-load the grid
                    flnd.userList.retrieve(authService, config, $scope, messenger);
                    messenger.showSuccessMessage($scope, 'Saved');
                }, function dismissed() {
                    // no action required
                });
            };

            $scope.loading = false;

        }
    ]);
