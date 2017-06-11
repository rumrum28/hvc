angular.module('starter.services', [])

.factory("Storage" , function ( ) {
  var storage = {
    "set": function ( value ) {      
      localStorage.setItem( "user" , JSON.stringify( value ) );
    },
    "get": function ( ) {
      return JSON.parse( localStorage.getItem( "user" ) );
    },
    "clear": function ( ) {
      localStorage.clear( );
    }
  }

  return storage;
})

.factory( "Util" , function ( ) {
  var utility = {
    "date": function ( ) {
      var dob = new Date();
      var dobArr = dob.toDateString().split(' ');
      return dobArr[2] + ' ' + dobArr[1] + ' ' + dobArr[3];
    },
    "time": function ( ) {
      var date = new Date( );
      var hours = date.getHours();
      var minutes = date.getMinutes();
      var ampm = hours >= 12 ? 'pm' : 'am';
      hours = hours % 12;
      hours = hours ? hours : 12; // the hour '0' should be '12'
      minutes = minutes < 10 ? '0'+minutes : minutes;
      var strTime = hours + ':' + minutes + ' ' + ampm;
      return strTime;
    },
    toArray: function ( obj ) {
      var arr = [ ];
      for( var prop in obj ) if ( typeof obj[prop] == "object" ) arr.push( obj[prop] );
      return arr;
    }
  }

  return utility;
} )

.service( "DB" , function ( $cordovaSQLite ) {  
  
  var db = {
    "create": function ( instance , tableName , fields , callback ) {      
      $cordovaSQLite.execute( instance , "CREATE TABLE IF NOT EXISTS " + tableName + " (" + db.Mapper(fields) + ")" )
      .then( function ( ) {

      } , function ( error ) {
        console.log( "Error" , error );
      } );
    },
    "Mapper": function ( fields ) {
      var set = [ ];
      for( var i in fields ) {
        set.push(i + " " + fields[i]);
        }

      return set;
    },
    "insert": function ( tableName , data , callback ) {
      var sql = "INSERT INTO " + tableName + "(" + Object.keys( data ).join( "," ) + ") VALUES( " + Object.keys( data ).map( function ( e ) {
        return "?"
      } ).join( "," ) + " )";    
      
      $cordovaSQLite.execute( db.instance , sql , Object.values( data ) )
      .then( callback , function ( error ) {
        console.log( "Failed: ", error );
      } );
    },

    "insertBatch": function ( tableName , data , callback ) {
      db.instance.transaction( function ( tx ) {
        data.forEach( function ( d ) {
          tx.executeSql( "INSERT INTO " + tableName + " (" + Object.keys(d).join(",") + ") VALUES (" 
            + Object.keys(d).map( function ( e ) {
                return "?"
              } ).join( "," ) + ")" , Object.values( d ) );
        } );
      } , function ( error ) {
        console.log( error );
      } , callback );
    },

    "show": function ( tableName , callback , query , logical ) {      
      var sql = "SELECT * FROM " + tableName + " " + ( (query) ? db.querySelector( query , (logical || false) ) : "" );

      $cordovaSQLite.execute( db.instance , sql )
      .then( function ( response ) {
        callback( ( window.isUsingWeb ? response : db.extract( response.rows ) ) );
      } , function ( error ) {
        console.log( "Failed", error );
      } );
    },

    "delete": function ( tableName , callback , query , logical ) {      
      var sql = "DELETE FROM " + tableName + " " + ( (query) ? db.querySelector( query , (logical || false) ) : "" );

      $cordovaSQLite.execute( db.instance , sql )
      .then( function ( response ) {
        callback( ( window.isUsingWeb ? response : db.extract( response.rows ) ) );
      } , function ( error ) {
        console.log( "Failed", error );
      } );
    },


    "querySelector": function ( query , logical ) {
      var keys = Object.keys(query);
      var values = Object.values(query);
      var arrayString = [ ];
      
      for (var i = 0 ; i < keys.length ; i ++ ) {
        arrayString.push(keys[i] + ' LIKE "%' + values[i] + '%"');
        }

        return "WHERE " + arrayString.join(" " + (logical ? "OR" : "AND") + " ");
    },

    "extract": function ( rows ) {
      var arrResult = [ ];
      for ( var i = 0 ; i < rows.length ; i ++ ) {
        arrResult.push( rows.item( i ) );
      }

      return { rows: arrResult };
    },

    "clear": function ( tableName ) {
      $cordovaSQLite.execute( db.instance , "DELETE FROM " + tableName );
    },

    "instance": null
  }

  return db;
} );
