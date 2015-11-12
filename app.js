angular.module('app', ['ts.grid']);

angular.module('app').config(AppConfig);

function AppConfig () {

}
AppConfig.$inject = [];


angular.module('app').controller('AppController', AppController);

function AppController ($scope, $q, $timeout) {
    this.grid = {
        model: {
            getGridData: function (params) {
                var deferred = $q.defer();
                var data = [
                    {id: 1, name: "Name 1"},
                    {id: 2, name: "Name 2"},
                    {id: 3, name: "Name 3"},
                    {id: 4, name: "Name 4"},
                    {id: 5, name: "Name 5"}
                ];
                data.totalCount = 5;
                deferred.resolve(data);
                return deferred.promise;
            }
        },
        configuration: {
            limit: 5,
            columns: [
                {title: "ID", name: "id", width: "50px"},
                {title: "Name", name: "name", width: "50px"}
            ]
        }
    };

    this.grid.delegate = {
        onRowClick: this.onGridRowClick.bind(this)
    }

    $timeout(function () {
        this.grid.getDataByCurrent();
    }.bind(this));
}

AppController.prototype.onGridRowClick = function () {
    console.log(this, arguments);
}

AppController.$inject = ["$scope", "$q", "$timeout"];
