angular.module('tNavi.controllers', ['ngMap'])

.controller('DashCtrl', function($scope, $timeout, $rootScope, Weather, Geo, Flickr, $ionicModal, $ionicPlatform) {
  var _this = this;

  $ionicPlatform.ready(function() {
    // Hide the status bar
    if(window.StatusBar) {
      StatusBar.hide();
    }
  });

  $scope.activeBgImageIndex = 0;

  this.getBackgroundImage = function(lat, lng, locString) {
    Flickr.search(locString, lat, lng).then(function(resp) {
      var photos = resp.photos;
      if(photos.photo.length) {
        $scope.bgImages = photos.photo;
        _this.cycleBgImages();
      }
    }, function(error) {
      console.error('Unable to get Flickr images', error);
    });
  };

  this.getCurrent = function(lat, lng, locString) {
    Weather.getAtLocation(lat, lng).then(function(resp) {
      /*
      if(resp.response && resp.response.error) {
        alert('This Wunderground API Key has exceeded the free limit. Please use your own Wunderground key');
        return;
      }
      */
      $scope.current = resp.data;
      console.log('GOT CURRENT', $scope.current);
      $rootScope.$broadcast('scroll.refreshComplete');
    }, function(error) {
      alert('Unable to get current conditions');
      console.error(error);
    });
  };

  this.cycleBgImages = function() {
    $timeout(function cycle() {
      if($scope.bgImages) {
        $scope.activeBgImage = $scope.bgImages[$scope.activeBgImageIndex++ % $scope.bgImages.length];
      }
      //$timeout(cycle, 10000);
    });
  };

  $scope.refreshData = function() {
    Geo.getLocation().then(function(position) {
      var lat = position.coords.latitude;
      var lng = position.coords.longitude;

      Geo.reverseGeocode(lat, lng).then(function(locString) {
        $scope.currentLocationString = locString;
        _this.getBackgroundImage(lat, lng, locString);
      });
      _this.getCurrent(lat, lng);
    }, function(error) {
      alert('Unable to get current location: ' + error);
    });
  };

  $scope.refreshData();
})

.controller('MapCtrl', function($scope, MapServ, $ionicLoading, $ionicModal, $ionicActionSheet, $timeout) {
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

  $scope.showModal = function (template) {
    if(!$scope.fieldModal) {
     // Load the modal from the given template URL
      $ionicModal.fromTemplateUrl(template, {
        scope: $scope,
        // The animation we want to use for the modal entrance
        animation: 'slide-in-up'
      }).then(function(modal) {
        $scope.fieldModal = modal;
        $scope.fieldModal.show();
      });
    } else {
      $scope.fieldModal.show();
    }
  };

  $scope.showDetails = function (ev, field){
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
         $scope.showModal('templates/fieldModal.html');
       }
       return true;
     }
   });

   // For example's sake, hide the sheet after two seconds
   $timeout(function() {
     hideSheet();
   }, 2000);

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
