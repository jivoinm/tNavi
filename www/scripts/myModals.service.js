angular.module('starter')
.factory('myModals', ['appModalService', function (appModalService){

var service = {
    showAddNewField: showAddNewField,
    showEditUser: showEditUser
};

function showAddNewField(model){
    // return promise resolved by '$scope.closeModal(data)'
    // Use:
    // myModals.showLogin(userParameters) // get this inject 'parameters' on 'loginModalCtrl'
    //  .then(function (result) {
    //      // result from closeModal parameter
    //  });
    return appModalService.show('templates/modals/fieldModal.html', 'formCtrl as vm', model)
    // or not 'as controller'
    // return appModalService.show('templates/modals/login.html', 'loginModalCtrl', userInfo)
}


function showEditUser(dataParams){
    // return appModalService....
}

return service;
}])


.controller('formCtrl', function($scope) {
  $scope.save = function(model){
    $scope.closeModal();
    console.log('Save', model);
  };

  $scope.close = function(){
    console.log('Close');
  };
});
