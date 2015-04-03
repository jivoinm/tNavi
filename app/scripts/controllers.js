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
      console.log(pos);
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
       { text: '<b>Save new Filed</b>' }
     ],
     titleText: 'New field Actions',
     cancelText: 'Cancel',
     cancel: function() {
       hideSheet();
       $scope.clearField();
      },
     buttonClicked: function(index) {
       if(index === 0){
         //save field name
         var area = google.maps.geometry.spherical.computeArea(poly.getPath());
         //$scope.showModal('templates/newFieldModal.html', {area: (area.toFixed(1)/10000).toFixed(1)});
         myModals.showAddNewField({
           settings: {
             title: 'Add New Parcel'
             },
           model: {
             fields: [
               { title: 'Place name', type: 'text', require: true },
               { title: 'Year', type: 'select', require: true, show_options: '2014,2015,2016' }
             ]
           }
           }).then(function (result) {
              // result from closeModal parameter
              console.log(result);
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

   function latLng2point(latLng) {
     return {
            x: (latLng.lng + 180) * (256 / 360),
            y: (256 / 2) - (256 * Math.log(Math.tan((Math.PI / 4) + ((latLng.lat * Math.PI / 180) / 2))) / (2 * Math.PI))
        };
    }

    function poly_gm2svg(gmPaths, fx) {
        var point,
        gmPath,
        svgPath,
        svgPaths = [],
            minX = 256,
            minY = 256,
            maxX = 0,
            maxY = 0;

        for (var pp = 0; pp < gmPaths.length; ++pp) {
            gmPath = gmPaths[pp], svgPath = [];
            for (var p = 0; p < gmPath.length; ++p) {
                point = latLng2point(fx(gmPath[p]));
                minX = Math.min(minX, point.x);
                minY = Math.min(minY, point.y);
                maxX = Math.max(maxX, point.x);
                maxY = Math.max(maxY, point.y);
                svgPath.push([point.x, point.y].join(','));
            }


            svgPaths.push(svgPath.join(' '))


        }
        return {
            path: 'M' + svgPaths.join('z M') + 'z',
            x: minX,
            y: minY,
            width: maxX - minX,
            height: maxY - minY
        };

    }

    function drawPoly(node, props) {
        var svg = node.cloneNode(false),
            g = document.createElementNS("http://www.w3.org/2000/svg", 'g'),
            path = document.createElementNS("http://www.w3.org/2000/svg", 'path');
        node.parentNode.replaceChild(svg, node);
        path.setAttribute('d', props.path);
        g.appendChild(path);
        svg.appendChild(g);
        svg.setAttribute('viewBox', [props.x, props.y, props.width, props.height].join(' '));
    }

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
