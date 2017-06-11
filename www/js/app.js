// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js

window.Object.values = function ( obj ) {
  var arr = [ ];
  for( key in obj ) {
    arr.push( obj[key] );
  }

  return arr;
}

function webSQL ( ) {
  window.isUsingWeb = true;
  window.sqlitePlugin = {};  
  window.sqlitePlugin.openDatabase = function() {  
    return window.openDatabase('hvc', '1.0', 'myDatabase', 10000000);
  };
}

webSQL( );

angular.module('starter', ['ionic', 'starter.controllers', 'starter.services', 'ion-autocomplete', 'ngCordova'])

.run(function($ionicPlatform, $cordovaSQLite, DB) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }

    var db = $cordovaSQLite.openDB( { "name": "hvc.db" , "location": "default" } );    
    DB.create( db , "student" , { id: "text" , firstname: "text" , middlename: "text" , lastname: "text" , course: "text" } );
    DB.create( db , "violation" , { studId: "text", minorviolation: "text", majorviolation: "text", customviolation: "text", date: "text", time: "text", synced: "integer default 0" });
    DB.create( db , "student" , { id: "text" , firstname: "text" , middlename: "text" , lastname: "text" , course: "text" } );
    DB.instance = db;
  });
})

.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider) {
  $ionicConfigProvider.tabs.position("bottom");
  $ionicConfigProvider.navBar.alignTitle("center")
  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

  // setup an abstract state for the tabs directive
  .state('tab', {
    url: '/tab',
    abstract: true,
    templateUrl: 'templates/tabs.html'
  })

  // Each tab has its own nav history stack:

  .state('tab.dash', {
    url: '/dash',
    views: {
      'tab-dash': {
        templateUrl: 'templates/tab-dash.html',
        controller: 'DashCtrl'
      }
    }
  })

  .state('tab.violation', {
      url: '/violation',
      views: {
        'tab-violation': {
          templateUrl: 'templates/tab-violation.html',
          controller: 'violationCtrl'
        }
      }
    })

  .state('tab.viewlist', {
      url: '/violation/list',
      views: {
        'tab-violation': {
          templateUrl: 'templates/tab-view.html',
          controller: 'ViewListCtrl'
        }
      }
    })

  .state('tab.about', {
    url: '/about',
    views: {
      'tab-about': {
        templateUrl: 'templates/tab-about.html',
        controller: 'aboutCtrl'
      }
    }
  })


  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/tab/dash');

});
