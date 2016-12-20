'use strict';

angular.module('navigationService', [])
    .factory('navigationService', ['authService', '$log', 'config', '$rootScope', '$sce',
        function(authService, $log, config, $rootScope, $sce) {
            var KEY = 'NAVIGATION_TREE';

            return {
                createTree: function() {
                    var tree = [{
                        entry: {
                            title: 'Home',
                            path: '#/'
                        },
                        children: []
                    }, {
                        entry: {
                            title: 'Contact Us',
                            path: '#/contact'
                        },
                        children: []
                    }];

                    if (authService.isAnonymous()) {
                        tree.push({
                            entry: {
                                title: 'Login',
                                path: '#/login'
                            },
                            children: []
                        });
                        tree.push({
                            entry: {
                                title: 'Submit Data',
                                path: '#/data'
                            },
                            children: []
                        });
                    } else { // signed-in successfully
                        // All authenticated users
                        tree.push({
                            entry: {
                                title: 'Submit Data',
                                path: ''
                            },
                            children: [{
                                entry: {
                                    title: 'Data Overview',
                                    path: '#/data'
                                },
                                children: []
                            }, {
                                entry: {
                                    title: 'Activity Log',
                                    path: '#/workdays'
                                },
                                children: []
                            }, {
                                entry: {
                                    title: 'Foraging Survey',
                                    path: '#/foraging'
                                },
                                children: []
                            }, {
                                entry: {
                                    title: 'Rookery Census',
                                    path: '#/rookery'
                                },
                                children: []
                            }]
                        });
                        // Only for admins
                        if (authService.isAdministrator()) {
                            tree.push({
                                entry: {
                                    title: 'Manage',
                                    path: ''
                                },
                                children: [{
                                    entry: {
                                        title: 'Approved Users',
                                        path: '#/users'
                                    }
                                }, {
                                    entry: {
                                        title: 'Pending Users',
                                        path: '#/users/pending'
                                    }
                                }, {
                                    entry: { // will create a divider
                                        title: '',
                                        path: ''
                                    }
                                }, {
                                    entry: {
                                        title: 'Volunteer Tracking',
                                        path: '' // will create a header
                                    }
                                }, {
                                    entry: {
                                        title: 'Activity Log',
                                        path: '#/workdays/all'
                                    }
                                }, {
                                    entry: {
                                        title: 'Activity Types',
                                        path: '#/worktypes'
                                    }
                                }, {
                                    entry: {
                                        title: 'Locations',
                                        path: '#/locations'
                                    }
                                }, {
                                    entry: { // will create a divider
                                        title: '',
                                        path: ''
                                    }
                                }, {
                                    entry: {
                                        title: 'Bird Surveys',
                                        path: '' // will create a header
                                    }
                                }, {
                                    entry: {
                                        title: 'Species',
                                        path: '#/species'
                                    }
                                }, {
                                    entry: {
                                        title: 'Waterbird Foraging Survey',
                                        path: '#/data/foraging'
                                    }
                                }, {
                                    entry: {
                                        title: 'Rookery Census',
                                        path: '#/data/rookery'
                                    }
                                }]
                            });
                        }
                    }

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

                        tree = this.createTree();
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
                                    nav += 'dropdown"><a class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">';
                                    nav += child.entry.title + ' <span class="caret"></span></a>';
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

                        $rootScope.navigation = $sce.trustAsHtml(nav);
                    });
                }
            };
        }
    ]);
