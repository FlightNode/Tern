'use strict';

/**
 * @ngdoc function
 * @name flightNodeApp.services:authService
 * @description
 * # authService
 * Service for handling authentication and authorization-related functionality.
 */
angular.module('authService', [])
    .factory('authService', ['$cookies', '$http', 'jwtHelper', '$rootScope', '$log',
        function($cookies, $http, jwtHelper, $rootScope, $log) {

            var TOKEN_KEY = 'org.flightnode.jwt';
            var roles;
            var userId;
            var userName;
            var displayName;
            var payload;

            return {

                getToken: function() {
                    return $cookies.get(TOKEN_KEY);
                },

                setToken: function(accessToken, expiresAt) {
                    $cookies.put(TOKEN_KEY, accessToken, { expires: expiresAt });
                },

                clearToken: function() {
                    var $this = this;

                    $this.roles = null;
                    $this.userId = null;
                    $this.userName = null;
                    $this.displayName = null;
                    $this.payload = null;
                    $cookies.remove(TOKEN_KEY);
                    $rootScope.display_name = '';
                },

                _getPayload: function() {
                    var $this = this;

                    if (!$this.payload) {
                        var token = $this.getToken();
                        if (token) {
                            $this.payload = jwtHelper.decodeToken(token);
                        } else {
                            return {};
                        }
                    }

                    return $this.payload;
                },

                _getRoles: function() {
                    var $this = this;

                    var roles = $this._getPayload().role || '';
                    if (!_.isArray(roles)) {
                        roles = [roles];
                    }

                    return roles;
                },

                _request: function(url, verb, data) {
                    var $this = this;

                    var token = $this.getToken();

                    var headers;
                    if (token) {
                        headers = { Authorization: 'bearer ' + token };
                    }

                    return $http({
                        url: url,
                        method: verb,
                        data: data,
                        headers: headers
                    });

                },

                get: function(url) {
                    var $this = this;

                    return $this._request(url, 'GET');
                },

                post: function(url, data) {
                    var $this = this;

                    return $this._request(url, 'POST', data);
                },

                put: function(url, data) {
                    var $this = this;

                    return $this._request(url, 'PUT', data);
                },

                delete: function(url) {
                    var $this = this;

                    return $this._request(url, 'DELETE');
                },

                patch: function(url) {
                    var $this = this;

                    return $this._request(url, 'PATCH');
                },

                // There is a good argument that this service is not doing "just one thing"...
                // 1) parsing data from the token, and 2) mediating requests
                //  Long term, consider splitting this in two or moving the request handling
                //  to some type of interceptor.

                getDisplayName: function() {
                    var $this = this;

                    if (!$this.displayName) {
                        $this.displayName = $this._getPayload().displayName;
                    }

                    return $this.displayName;
                },

                getUserId: function() {
                    var $this = this;

                    if (!$this.userId) {
                        $this.userId = $this._getPayload().nameid;
                    }

                    return $this.userId;
                },

                getUserName: function() {
                    var $this = this;

                    if (!$this.userName) {
                        $this.userName = $this._getPayload().unique_name;
                    }

                    return $this.userName;
                },

                isAdministrator: function() {
                    var $this = this;

                    return _.includes($this._getRoles(), 'Administrator');
                },

                isCoordinator: function() {
                    var $this = this;

                    return _.includes($this._getRoles(), 'Coordinator');
                },

                isTeamLead: function() {
                    var $this = this;

                    return _.includes($this._getRoles(), 'Lead');
                },

                isReporter: function() {
                    var $this = this;

                    return _.includes($this._getRoles(), 'Reporter');
                },

                isAnonymous: function() {
                    var $this = this;

                    return ($this.getUserId() || -1) === -1;
                }
            };
        }
    ]);
