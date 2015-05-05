angular.module('tNavi.services', [])

.factory('MapServ', function() {
  // Might use a resource here that returns a JSON array

  // Some fake testing data
  var maps = [{
    id: 0,
    name: 'Parcela 1',
    details: {
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
    }
  }];

  return {
    all: function() {
      return maps;
    },
    remove: function(map) {
      maps.splice(maps.indexOf(map), 1);
    },
    add: function (map){
      var lastMapIndex = maps.length--;
      map.id = lastMapIndex;
      maps.push(map);
    },
    get: function(mapId) {
      for (var i = 0; i < maps.length; i++) {
        if (maps[i].id === parseInt(mapId)) {
          return maps[i];
        }
      }
      return null;
    }
  }
});
