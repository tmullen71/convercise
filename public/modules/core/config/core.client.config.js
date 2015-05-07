'use strict';

// Configuring the Articles module
angular.module('core').run(['Menus',
function(Menus) {
  // Set top bar menu items
  Menus.addMenuItem('topbar', 'Classroom', 'articles', 'item', '/articles(/create)?');
  Menus.addMenuItem('topbar', 'Track Homework', 'articles', 'item', '/articles(/create)?');
  Menus.addMenuItem('topbar', 'Manage Assignments', 'articles', 'item', '/articles(/create)?');
}
]);
