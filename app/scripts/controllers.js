angular.module('tNavi.controllers', ['ngMap'])

.controller('DashCtrl', function($scope, $timeout, $rootScope, Weather, Geo, Flickr, $ionicModal, $ionicPlatform) {
  var _this = this;

  $ionicPlatform.ready(function() {
    // Hide the status bar
    if(window.StatusBar) {
      StatusBar.hide();
    }
  });

})

.controller('MapCtrl', function($scope, MapServ, $ionicLoading, $ionicModal, $ionicActionSheet, $timeout, $state, myModals) {
  var infoWindow = new google.maps.InfoWindow();
  var poly, map;
  var markers = [];
  var path = new google.maps.MVCArray;

  $scope.remove = function(map) {
    MapServ.remove(map);
  };

  $scope.$on('mapInitialized', function(event, map) {
    $scope.map = map;
    $scope.places = MapServ.all();
    if($scope.places.length > 0 ){
      $ionicLoading.show({
        template: 'Loading...'
      });

      var pos = new google.maps.LatLng($scope.places[0].details.latitude, $scope.places[0].details.longitude);

      $scope.map.setCenter(pos);
      $ionicLoading.hide();
    }

    poly = new google.maps.Polygon({
      strokeWeight: 3,
      fillColor: '#5555FF'
    });
    poly.setMap(map);
    poly.setPaths(new google.maps.MVCArray([path]));

    google.maps.event.addListener(poly, 'click', function (event) {
      $scope.showNewFieldActions(event);
    });

    $scope.addNewFieldMarker = function (event){
      path.insertAt(path.length, event.latLng);

      var marker = new google.maps.Marker({
        position: event.latLng,
        map: map,
        draggable: true
      });

      markers.push(marker);
      marker.setTitle("#" + path.length);

      google.maps.event.addListener(marker, 'click', function() {
        marker.setMap(null);
        for (var i = 0, I = markers.length; i < I && markers[i] != marker; ++i);
          markers.splice(i, 1);
          path.removeAt(i);
        }
      );

      google.maps.event.addListener(marker, 'dragend', function() {
        for (var i = 0, I = markers.length; i < I && markers[i] != marker; ++i);
          path.setAt(i, marker.getPosition());
      });

    };

    $scope.clearField = function(){
      for (var i = 0; i < markers.length; i++) {
           markers[i].setMap(null);
       }
      markers = new Array();
      path = new google.maps.MVCArray;
      poly.setPaths(new google.maps.MVCArray([path]));
    };

  });

  $scope.centerOnMe= function(){
    $ionicLoading.show({
      template: 'Loading...'
    });

    navigator.geolocation.getCurrentPosition(function(position) {
      var pos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
      $scope.map.setCenter(pos);
      $ionicLoading.hide();
    });
  };

   $scope.drawSvgPolygon = function(field){
     for (var i = 0; i < paths.length; ++i) {
        paths[i] = google.maps.geometry.encoding.decodePath(paths[i]);
    }
     svgProps = poly_gm2svg(paths, function (latLng) {
        return {
            lat: latLng.lat(),
            lng: latLng.lng()
        }
     });
     drawPoly(document.getElementById('svg'), svgProps)
   };

  $scope.showFieldActions = function (ev, field){
    var hideSheet = $ionicActionSheet.show({
     buttons: [
       { text: '<b>Filed Details</b>' },
       { text: '<span class="ion-android-compass">Navigate</span>' }
     ],
     destructiveText: 'Delete',
     titleText: 'Select Action on '+field.name,
     cancelText: 'Cancel',
     cancel: function() {
          // add cancel code..
        },
     buttonClicked: function(index) {
       if(index === 0){
         //$scope.showModal('templates/fieldModal.html');
         $state.go('tab.list-detail', {placeId: field.id}, {location: false});
       }

       if(index === 1){
         $scope.drawSvgPolygon(field);
       }
       return true;
     }
   });

   // For example's sake, hide the sheet after two seconds
   $timeout(function() {
     hideSheet();
   }, 2000);

  };

  $scope.showNewFieldActions = function (ev){
    var hideSheet = $ionicActionSheet.show({
     buttons: [
       { text: '<b>Snimi novu parcelu</b>' }
     ],
     titleText: 'Nova parcela',
     cancelText: 'Izadji',
     cancel: function() {
       hideSheet();
       $scope.clearField();
      },
     buttonClicked: function(index) {
       if(index === 0){
         //save field name
         var path = poly.getPath();
         var area = google.maps.geometry.spherical.computeArea(path);

         myModals.showAddNewField({
           settings: {
             title: 'Dodaj novu parcelu'
             },
           model: {
             fields: [
               { title: 'Ime', type: 'text', require: true },
               { title: 'Broj', type: 'text' }
             ]
           }
         }).then(function (parcelModel) {
           parcelModel.details = {
             longitude: 20.70635857720933,
             latitude: 45.39334149009799,
             coordinates: [
               [45.39390795434832, 20.70458664698406],
               [45.39390795434832, 20.7084403592479],
               [45.39413979800767, 20.7084403592479],
               [45.39413979800767, 20.7083026856469],
               [45.39520523352119, 20.7083026856469],
               [45.39520523352119, 20.70444556016851],
               [45.39499532557855, 20.70444556016851],
               [45.39499532557855, 20.70458664698406],
               [45.39390795434832, 20.70458664698406]
               ]
           };

              console.log('Result ', parcelModel);

              MapServ.add(parcelModel);
          });
       }
       return true;
     }
   });

   $scope.saveNewField = function (){
     var model = $scope.fieldModal.scope.model;
     model.details = {
       longitude: 20.70635857720933,
       latitude: 45.39334149009799,
       coordinates: []
     };
     MapServ.add(model);
   };


  };

})

.controller('MapNaviCtrl', function($scope, $stateParams, MapServ) {
  $scope.place = MapServ.get($stateParams.placeId);
})

.controller('MapDetailCtrl', function($scope, $stateParams, MapServ) {
  $scope.place = MapServ.get($stateParams.placeId);
})

.controller('ListCtrl', function($scope, MapServ) {
  $scope.places = MapServ.all();
})

.controller('ListDetailCtrl', function($scope, $stateParams, MapServ) {
  $scope.place = MapServ.get($stateParams.placeId);
})

.controller('AccountCtrl', function($scope) {
  $scope.settings = {
    enableFriends: true
  };
});
