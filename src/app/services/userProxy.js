'use strict';

/**
 * @ngdoc function
 * @name flightNodeApp.Services:userProxy
 * @description
 * # userProxy
 * Controller for the create user page.
 */
angular.module('flightNodeApp')
    .factory('userProxy', ['$http', '$log', 'authService', 'config', 'messenger',
        function($http, $log, authService, config, messenger) {
            return {
                insert: function($scope, $uibModalInstance) {
                    return function() {
                        $scope.loading = true;

                        $scope.user.active = true;

                        authService.post(config.users, $scope.user)
                            .then(function success() {

                                $uibModalInstance.close();

                            }, function error(response) {

                                messenger.displayErrorResponse($scope, response);

                            })
                            .finally(function() {
                                $scope.loading = false;
                            });
                    };
                },

                register: function($scope, done) {
                    return function() {
                        $log.info('submit registration');
                        $scope.loading = true;

                        authService.post(config.usersRegister, $scope.user)
                            .then(function success() {

                                messenger.showSuccessMessage($scope, 'Your new account has been created with activation pending. You will receive an e-mail once your account has been approved.');
                                done();

                            }, function error(response) {

                                messenger.displayErrorResponse($scope, response);

                            })
                            .finally(function() {
                                $scope.loading = false;
                            });
                    };
                },

                update: function($scope, $uibModalInstance, id) {
                    return function() {

                        $scope.loading = true;
                        var url = config.users + id;

                        authService.put(url, $scope.user)
                            .then(function success() {

                                $uibModalInstance.close();

                            }, function error(response) {

                                messenger.displayErrorResponse($scope, response);
                            })
                            .finally(function() {
                                $scope.loading = false;
                            });
                    };
                },

                putProfile: function($scope, id) {
                    return function() {

                        $scope.loading = true;
                        var url = config.usersProfile + '/' + id;

                        authService.put(url, $scope.user)
                            .then(function success() {

                                messenger.showSuccessMessage($scope, 'Your account profile has been saved.');

                            }, function error(response) {

                                messenger.displayErrorResponse($scope, response);
                            })
                            .finally(function() {
                                $scope.loading = false;
                            });
                    };
                },

                getProfile: function($scope) {
                    var url = config.usersProfile;

                    authService.get(url)
                        .then(function success(response) {

                            $scope.user = response.data;

                        }, function error(response) {

                            messenger.displayErrorResponse($scope, response);
                        });
                },

                findOne: function($scope, id) {
                    return function() {
                        var url = config.users + id;

                        authService.get(url)
                            .then(function success(response) {

                                $scope.user = response.data;

                            }, function error(response) {

                                messenger.displayErrorResponse($scope, response);
                            });
                    };
                },

                pending: function($scope) {
                    var url = config.usersPending;

                    authService.get(url)
                        .then(function success(response) {

                            $scope.users = response.data;

                        }, function error(response) {

                            messenger.displayErrorResponse($scope, response);
                        });
                },

                approve: function($scope, ids, msg, done) {
                    $scope.loading = true;
                    var url  = config.usersPending;

                    authService.post(url, ids)
                        .then(function success() {
                            messenger.showSuccessMessage($scope, msg);
                            done();
                        }, function error(response) {
                            messenger.displayErrorResponse($scope, response);
                        })
                        .finally(function() {
                            $scope.loading = false;
                        });
                },

                roleInfo: function($scope) {

                    // Hard-code for now, think about alternatives in the future
                    var header = 'Role Descriptions';
                    var text = '<p>At this time, it is best to use either "Administrative user" or "Volunteer data reporter". The precise functionality for "Project Coordinator" and "Volunteer Team Lead" has not been fully defined, although "Coordinator" generally has similar rights as "Administrator" (so use with extreme caution).</p>';
                    

                }
            };
        }
    ]);