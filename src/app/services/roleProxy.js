'use strict';

angular.module('roleProxy', [])
    .factory('roleProxy', ['$http', 'authService', 'config',
        function($http, authService, config) {
            return {

                getAll: function() {
                    /*
                    1	Administrative user		Administrator
                    2	Volunteer data reporter	Reporter
                    3	Project coordinator		Coordinator
                    4	Volunteer team lead		Lead
                    */
                    // Hard-code overrides for TERN. Note that Project Coordinator is no longer used.
                   return [
                        { name: 'Administrator', id: 1 },
                        { name: 'Royal Tern', id: 4 },
                        { name: 'TERN Citizen Scientist', id: 2 }
                    ];
                }

            };
        }
    ]);
