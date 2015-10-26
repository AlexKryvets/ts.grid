angular.module('app', ['ts.grid']);

angular.module('app').config(AppConfig);

function AppConfig () {

}
AppConfig.$inject = [];


angular.module('app').controller('AppController', AppController);

function AppController ($scope) {

}
AppController.$inject = ['$scope'];
