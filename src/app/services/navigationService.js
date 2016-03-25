'use strict';

angular.module('navigationService', [])
    .factory('navigationService', ['authService', '$log', '$rootScope', 'config',
        function(authService, $log, $rootScope, config) {
            var KEY = 'NAVIGATION_TREE';

            return {
                createAnonymousTree: function() {
                    var tree =  [
                        {
                            children: [],
                            entry: {
                                title: 'Home',
                                path: '#/'
                            }
                        }, {
                            children: [],
                            entry: {
                                title: 'Submit Data',
                                path: '#/data'
                            }
                        }, {
                            children: [],
                            entry: {
                                title: 'Contact Us',
                                path: '#/contact'
                            }
                        }, {
                            children: [],
                            entry: {
                                title: 'FAQ',
                                path: '#/faq'
                            }
                        }];
                    return tree;
                },
                createAuthenticatedTree: function() {
                    var tree =  [
                        {
                            children: [],
                            entry: {
                                title: 'Home',
                                path: '#/'
                            }
                        }, {
                            children: [
                                {
                                  children: [],
                                  entry: {
                                    title: 'Workday Logging',
                                    path: '#/workdays'
                                  }
                                }
                            ],
                            entry: {
                                title: 'Submit Data',
                                path: '#/data'
                            }
                        }, {
                            children: [],
                            entry: {
                                title: 'Contact Us',
                                path: '#/contact'
                            }
                        }, {
                            children: [],
                            entry: {
                                title: 'FAQ',
                                path: '#/faq'
                            }
                        }, {
                            children: [],
                            entry: {
                                title: 'My Account',
                                path: '#/users/profile'
                            }
                        }];
                    return tree;
                },
                getTree: function(callback) {
                    var tree = sessionStorage.getItem(KEY);

                    if (tree === null || tree === 'null') {

                      var tree = this.createAuthenticatedTree();
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
                                nav += 'nav nav-pills">';
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

                        $rootScope.navigation = nav;
                    });
                }
            };
        }
    ]);