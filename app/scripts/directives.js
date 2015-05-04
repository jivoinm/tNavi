angular.module('ionic.weather.directives', [])

.constant('WEATHER_ICONS', {
  'partlycloudy': 'ion-ios7-partlysunny-outline',
  'mostlycloudy': 'ion-ios7-partlysunny-outline',
  'cloudy': 'ion-ios7-cloudy-outline',
  'rain': 'ion-ios7-rainy-outline',
  'tstorms': 'ion-ios7-thunderstorm-outline',
  'sunny': 'ion-ios7-sunny-outline',
  'clear-day': 'ion-ios7-sunny-outline',
  'nt_clear': 'ion-ios7-moon-outline',
  'clear-night': 'ion-ios7-moon-outline'
})

.directive('currentTime', function($timeout, $filter) {
  return {
    restrict: 'E',
    replace: true,
    template: '<span class="current-time">{{currentTime}}</span>',
    scope: {
      localtz: '=',
    },
    link: function($scope, $element, $attr) {
      $timeout(function checkTime() {
        if($scope.localtz) {
          $scope.currentTime = $filter('date')(+(new Date), 'h:mm') + $scope.localtz;
        }
        $timeout(checkTime, 500);
      });
    }
  }
 })

.directive('naviBar', function($compile, $animate) {
  return {
    restrict: 'E',
    template: '<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="50"><rect ng-attr-x="{{item.x}}" ng-attr-y="{{item.y}}" ng-attr-width="{{item.width}}" ng-attr-height="{{item.height}}" ng:attr:r="1" style="fill:#{{item.fillColor}}; stroke:#000000;stroke-width:2px;" ng-repeat="item in items" /> </svg>',
    replace: true,
    scope: true,
    link: function($scope, $element, $attr) {
      var barWidth = $element[0].parentNode.parentNode.clientWidth;
      var barHeight = $element[0].parentNode.parentNode.clientHeight;;
      var rectSize = barHeight - 4;
      var nrOfRects = Math.round(barWidth / (rectSize + 10));

      $scope.items = [];
      for(i=0; i<nrOfRects; i++){
        var item = {
          width: rectSize,
          height: rectSize,
          x: (rectSize * i),
          y: 10,
          fillColor: '009900'
        }
        $scope.items.push(item);
      }

      console.log(barWidth, barHeight);
    }
  }
})
.directive('naviPanel', function() {
  mapWidth    = 200;
  mapHeight   = 100;
  /**
  *@param latLng object with properties lat and lng(of the coordinate)
  *@return object with properties x and y(of the translated latLng)
  **/
  function latLng2point( lat, lng){

    return {
            x:(lng+180)*(mapWidth/360),
            y:(mapHeight/2)-(mapWidth*Math.log(Math.tan((Math.PI/4)
                       +((lat*Math.PI/180)/2)))/(2*Math.PI))
           };
  }

  function poly_gm2svg(gmPaths) {

    var point,
    gmPath,
    svgPath,
    svgPaths = [],
        minX = mapWidth,
        minY = mapWidth,
        maxX = 0,
        maxY = 0;

    for (var pp = 0; pp < gmPaths.length; ++pp) {
        gmPath = gmPaths[pp], svgPath = [];
        point = latLng2point(gmPath[0],gmPath[1]);
        minX = Math.min(minX, point.x);
        minY = Math.min(minY, point.y);
        maxX = Math.max(maxX, point.x);
        maxY = Math.max(maxY, point.y);
        svgPath.push([point.x, point.y].join(','));
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
    svg.setAttribute('width', mapWidth);
    svg.setAttribute('height', mapHeight);
}

  return {
    restrict: 'E',
    template: '<svg xmlns="http://www.w3.org/2000/svg"></svg>',
    replace: true,
    link: function($scope, $element, $attr) {
      mapWidth = $element[0].parentNode.parentNode.clientWidth;
      //mapHeight = $element[0].parentNode.parentNode.clientHeight;
      mapHeight = mapWidth;
      if($scope.place){
        //draw map path
        var svgProps = poly_gm2svg($scope.place.details.coordinates);
        drawPoly($element[0], svgProps);
      }
     

      console.log(mapWidth, mapHeight);
    }
  }
});
