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
})

/**
 * A simple example service that returns some data.
 */
.factory('Friends', function() {
  // Might use a resource here that returns a JSON array

  // Some fake testing data
  var friends = [{
    id: 0,
    name: 'Ben Sparrow',
    notes: 'Enjoys drawing things',
    face: 'https://pbs.twimg.com/profile_images/514549811765211136/9SgAuHeY.png'
  }, {
    id: 1,
    name: 'Max Lynx',
    notes: 'Odd obsession with everything',
    face: 'https://avatars3.githubusercontent.com/u/11214?v=3&s=460'
  }, {
    id: 2,
    name: 'Andrew Jostlen',
    notes: 'Wears a sweet leather Jacket. I\'m a bit jealous',
    face: 'https://pbs.twimg.com/profile_images/491274378181488640/Tti0fFVJ.jpeg'
  }, {
    id: 3,
    name: 'Adam Bradleyson',
    notes: 'I think he needs to buy a boat',
    face: 'https://pbs.twimg.com/profile_images/479090794058379264/84TKj_qa.jpeg'
  }, {
    id: 4,
    name: 'Perry Governor',
    notes: 'Just the nicest guy',
    face: 'https://pbs.twimg.com/profile_images/491995398135767040/ie2Z_V6e.jpeg'
  }];


  return {
    all: function() {
      return friends;
    },
    get: function(friendId) {
      // Simple index lookup
      return friends[friendId];
    }
  }
});
