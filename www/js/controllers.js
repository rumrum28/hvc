  var host = "http://192.168.1.36/Server";

angular.module('starter.controllers', [])

.controller('DashCtrl', function($scope, $ionicModal, $ionicPopup, $http, Storage, $state) {    

  $scope.post = { };
  $scope.collectPosts = [ ];

  $scope.filterPost = function ( userId ) {
    return ( userId == Storage.get( ).id ) ? true : false;
  }

  $scope.confirmDelete = function ( postId ) {
    var confirmPopup = $ionicPopup.confirm( {
      "title": "Delete",
      "template": "Are you sure you want to delete post"
    } );

    confirmPopup.then( function ( response ) {
      if ( response ) {
        $scope.deletePost( postId );
      }
    } );
  }

  $scope.showModal = function ( ) {
    $scope.modal.show( );
  }

  $scope.hideModal = function ( ) {
    $scope.post = { };
    $scope.modal.hide();
    $scope.modal1.hide();
  }
})

.controller('violationCtrl', function($scope, $ionicModal, $http, $cordovaSQLite, DB, $q, Util, $state, $ionicPopup, $window, $ionicHistory, $ionicLoading) {

  $ionicModal.fromTemplateUrl('templates/modal/modal-violation.html' , {
    scope: $scope,
    animation: "animated slideInLeft",
    hideDelay: 1000
  }).then( function ( modal1 ) {    
    $scope.modal1 = modal1;
  } );
  $ionicModal.fromTemplateUrl('templates/modal/modal-viewlist.html' , {
    scope: $scope,
    animation: "animated slideInLeft",
    hideDelay: 1000
  }).then( function ( modal2 ) {
    $scope.modal2 = modal2;
  } );

  $scope.student = { };

  $scope.insertStudent = function ( ) {
    $scope.student.date = Util.date();  
    $scope.student.time = Util.time();      
      console.log( $scope.student );
      DB.insert( "violation" , $scope.student , function ( ) {
        $scope.student = { };
        $scope.violation = { };
         var alertPopup = $ionicPopup.alert({
           title: 'Success',
           template: 'Successfully save.',
           animation: 'animated bounceInDown'
         });

         alertPopup.then(function(res) {
            $scope.modal1.hide( );
         });
      });
  }

  $scope.showStudents = function ( ) {
    DB.show( "student" , function ( res ) {
      console.log(res.rows);
      console.log( Util.date() );
      console.log( Util.time() );
    } );    
  }

  $scope.sync = function ( ) {
    $ionicLoading.show();
    DB.clear( "student" );
    $http.get( host + "/fetch_all_student.php" )
    .then( function ( response ) {
      DB.insertBatch( "student" , response.data , function ( response ) {
        console.log( "Syncronization Success" );
        $ionicLoading.hide();
        var alertPopup = $ionicPopup.alert({
           title: 'Success',
           template: 'Successfully sync.',
           animation: 'animated bounceInDown'
         });
        alertPopup.then(function(res) {
            $scope.checkTable( );
         });
      } );      
    } );
 }
  
  $scope.dropTable = function ( ) {
    DB.clear( "violation" );
  }

  $scope.dropDown = function ( query ) {
    var defer = $q.defer();

    if ( query ) {
      DB.show( "student" , function ( response ) {
        var rowsFormat = Util.toArray( response.rows );
        rowsFormat = rowsFormat.map( function ( row ) {
          row.fullname = row.firstname + " " + row.middlename + " " + row.lastname;
          return row;
        } );
        defer.resolve( { "items": rowsFormat } );
      } , { "id": query , "firstname": query , "lastname": query , "middlename": query } , true );

      return defer.promise;
    } else {
      return { "items": [] };
    }    
  }

   $scope.violation = { };
   
  $scope.selectItem = function (cb) {
    $scope.violation.student = cb.item;
  }

  $scope.syncServer = function ( ) {
    $ionicLoading.show();
    DB.show( "violation" , function ( res ) {
      var sync = Util.toArray(res.rows);      
      $http.post( host + "/save_caption.php" , sync )
      .then( function ( response ) {
        $ionicLoading.hide();
        DB.clear("violation");
        DB.insertBatch( "violation", response.data );
        var alertPopup = $ionicPopup.alert({
           title: 'Success',
           template: 'Sync complete.',
           animation: 'animated bounceInDown'
         });
      } );
    } , { synced: 0 } );
  };  

  $scope.verifyPassword = function ( fn ) {    
    $scope.verify = {};
    $ionicLoading.show();
    $http.get( host + "/check.php" )
    .then( function (res) {
      $ionicLoading.hide();
      if ( res.data.status === "active" ) {
        var verify = $ionicPopup.show( {
          template: '<input type="password" ng-model="verify.password" placeholder="Password">',
          title: 'Enter Sync Password',
          scope: $scope,
          buttons: [
            {text: 'Cancel'},
            {
              text: 'Confirm',
              type: 'button-positive',
              onTap: function () {
                $ionicLoading.show();
                $http.post( host + "/sync_pass.php" , $scope.verify )
                .then( function ( res ) {
                  $ionicLoading.hide();

                  if (res.data.authenticated) {
                    return $scope[fn]();
                  }

                  $ionicPopup.alert({
                     title: 'Failed to sync',
                     template: 'Incorrect Password',
                     animation: 'animated bounceInDown'
                   });
                } );
              }
            }
          ]
        } );
      }
    } )
    .catch( function (err) {
      $ionicLoading.hide();
      $ionicPopup.alert({
         title: 'Network Error',
         template: 'Failed connecting to server',
         animation: 'animated bounceInDown'
       });
    } );
  };

  $scope.listItems= [];
  $scope.toggle = false;
  // $scope.hde = 1;
  // $scope.firstview= [];
  $scope.checkTable = function ( ) {
    DB.show( "student" , function ( res ) {      
      if (res.rows.length > 0) {
        $scope.firstview = Util.toArray( res.rows );
        $scope.toggle = true;
      }
    });
  }; 

  $scope.checkTable( );
})
 
.controller('violationDetailCtrl', function($scope, $cordovaSQLite, DB, Util) {  
  
})

.controller('ViewListCtrl', function ($scope, DB, Util, $state, $ionicPopup, $http) {
  $scope.listItems= [];
  $scope.violation = { };

  DB.show( "violation" , function ( ris ) {
    DB.show( "student" , function ( students ) {      
      $scope.violation = { };      
      if (ris.rows.length > 0) {      
        var studentArray = Util.toArray( students.rows );
        var violationArray = Util.toArray( ris.rows );
        violationArray = _.map( violationArray , function ( violation ) {
          violation.student = _.find( studentArray, { "id": violation.studId } );
          return violation;
        } );

        $scope.listItems = violationArray;
      }   
    } );
  });

  $scope.confirmDelete2 = function ( violationId ) {
    var confirmPopup = $ionicPopup.confirm( {
      "title": "Delete",
      "template": "Are you sure you want to delete record"
    } );

    confirmPopup.then( function ( response ) {
      if ( response ) {
        // $scope.deletePost( studId );
        DB.delete( "violation" , function ( res ) {
          console.log(res.rows);
        } );  
      }
    } );
  }

  $scope.deletePost = function ( studId ) {
    $http.post( host + "/delete_post.php" , { "studId": studId } )
    .then( function ( response ) {
      if ( response.data.status ) {
        // $scope.getAllPosts( );
        $state.go('tab.view',null,{reload:true}); 
      }
    } );
  }
})

.controller('aboutCtrl', function($scope, $state, $ionicViewSwitcher, Storage) {
 
})
;
