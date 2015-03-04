angular.module('starter.controllers', ['ngMap'])

.controller('DashCtrl', function($scope) {})

.controller('MapCtrl', function($scope, MapServ, $ionicLoading) {
  var infoWindow = new google.maps.InfoWindow();
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
      console.log(pos);
      $scope.map.setCenter(pos);
      $ionicLoading.hide();
    }
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

  $scope.showDetails = function (event){
    var contentString = '<b>Bermuda Triangle polygon</b><br>' +
        'Clicked location: <br>' + event.latLng.lat() + ',' + event.latLng.lng() +
        '<br>';
    // Replace the info window's content and position.
    infoWindow.setContent(contentString);
    infoWindow.setPosition(event.latLng);
    infoWindow.open($scope.map);
  };
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
