'use strict';

angular.module('navigationService', [])
    .factory('navigationService', ['authService', '$log', '$rootScope', 'config',
        function(authService, $log, $rootScope, config) {
            var KEY = 'NAVIGATION_TREE';

            return {
                createTree: function() {
                    var tree = [
                        {
                            entry: {
                                title: 'Home',
                                path: '#/'
                            },
                            children: []
                        },
                    ];

                    if (authService.isAnonymous()) {
                        $log.info('building anonymous tree');
                        tree.push({
                            entry: {
                                title: 'Login',
                                path: '#/login'
                            },
                            children: []
                        });
                    } else { // signed-in successfully
                        if (authService.isReporter()) {
                            $log.info('building reporter tree');
                            tree.push({
                                entry: {
                                    title: 'Submit Data',
                                    path: '#/data'
                                },
                                children: [
                                    {
                                      entry: {
                                        title: 'Workday Logging',
                                        path: '#/workdays'
                                      },
                                      children: []
                                    }
                                ]
                            });
                        }
                        if (authService.isAdministrator()) {
                            $log.info('building administrator tree');
                            tree.push({
                                entry: {
                                    title: 'Manage',
                                    path: ''
                                },
                                children: [
                                    {
                                        entry: {
                                            title: 'Approved Users',
                                            path: '#/users'
                                        }
                                    },
                                    {
                                        entry: {
                                            title: 'Pending Users',
                                            path: '#/users/pending'
                                        }
                                    },
                                    {
                                        entry: {    // will create a divider
                                            title: '',
                                            path: ''
                                        }
                                    },
                                    {
                                        entry: {
                                            title: 'Volunteer Tracking',
                                            path: ''    // will create a header
                                        }
                                    },
                                    {
                                        entry: {
                                            title: 'Work Days',
                                            path: '#/workdays'
                                        }
                                    },
                                    {
                                        entry: {
                                            title: 'Work Types',
                                            path: '#/worktypes'
                                        }
                                    },
                                    {
                                        entry: {
                                            title: 'Locations',
                                            path: '#/locations'
                                        }
                                    },
                                    {
                                        entry: {    // will create a divider
                                            title: '',
                                            path: ''
                                        }
                                    },
                                    {
                                        entry: {
                                            title: 'Bird Surveys',
                                            path: '' // will create a header
                                        }
                                    },
                                    {
                                        entry: {
                                            title: 'Species',
                                            path: '#/species'
                                        }
                                    }
                                ]
                            });
                        }
                    }

                    tree.push({
                            entry: {
                                title: 'Contact Us',
                                path: '#/contact'
                            },
                            children: []
                        });
                    tree.push({
                            entry: {
                                title: 'FAQ',
                                path: '#/faq'
                            },
                            children: []
                        });

                    if (!authService.isAnonymous()) {
                        tree.push({
                            entry: {
                                title: 'My Account',
                                path: '#/users/profile'
                            },
                            children: []
                        });
                        tree.push({
                            entry: {
                                title: 'Sign Off',
                                path: '#/logout'
                            },
                            children: []
                        });
                    }

                    return tree;
                },

                getTree: function(callback) {
                    var tree = sessionStorage.getItem(KEY);

                    if (tree === null || tree === 'null') {

                      var tree = this.createTree(); //createAuthenticatedTree();
                      callback(tree);

                    } else {
                        tree = JSON.parse(tree);
                        tree = tree || {
                            children: []
                        };
                        callback(tree.children);
                    }
                },
                resetTree: function() {
                    sessionStorage[KEY] = null;
                    this.buildNavigation();
                },
                buildNavigation: function() {
                    var $this = this;

                    var nav = '';
                    var topLevel = true;

                    var build = function(top) {
                        if (top) {
                            nav += '<ul class="';

                            if (topLevel) {
                                nav += 'nav navbar-nav">';
                                topLevel = false;
                            } else {
                                nav += ' dropdown-menu">';
                            }

                            top.forEach(function(child) {
                                var hasChildren = (_.isArray(child.children) && child.children.length > 0);

                                nav += '\r<li role="presentation" class="';

                                if (hasChildren) {
                                    nav += 'dropdown"><a ng-href="' + child.entry.path;
                                    nav += '" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">';
                                    nav += child.entry.title + '</a>';
                                } else {
                                    if (child.entry && child.entry.path && child.entry.title) {
                                        nav += '"><a href="' + child.entry.path + '">' + child.entry.title + '</a>';
                                    } else if (child.entry && child.entry.title) {
                                        nav += 'dropdown-header">' + child.entry.title;
                                    } else {
                                        nav += 'divider" role="separator">';
                                    }
                                }

                                if (hasChildren) {
                                    build(child.children);
                                }

                                nav += '\r</li>';
                            });

                            nav += '\r</ul>';
                        }
                    };

                    $this.getTree(function(top) {

                        build(top);

                        $rootScope.navigation = nav;
                    });
                }
            };
        }
    ]);