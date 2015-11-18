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
                    {id: 1, name: "Name 1", date: new Date},
                    {id: 2, name: "Name 2", date: new Date},
                    {id: 3, name: "Name 3", date: new Date},
                    {id: 4, name: "Name 4", date: new Date},
                    {id: 5, name: "Name 5", date: new Date}
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
                {title: "Name", name: "name", width: "50px"},
                {title: "Date", name: "date", width: "50px"}
            ]
        }
    };

    this.grid.delegate = {
        onCreate: this.onGridCreate.bind(this),
        onRowClick: this.onGridRowClick.bind(this),
        onRowDoubleClick: this.onGridRowDoubleClick.bind(this),
        onRowSelect: this.onGridRowSelect.bind(this)
    };
}

AppController.prototype.onGridCreate = function (gridCtrl) {
    var promise = this.grid.getData();
    promise.then(function () {
        this.grid.setSelectionByIndex([1,3], true);
    }.bind(this));
};

AppController.prototype.onGridRowClick = function () {
    console.log("click");
};

AppController.prototype.onGridRowDoubleClick = function () {
    console.log("dblclick");
};

AppController.prototype.onGridRowSelect = function () {
    console.log("select");
};

AppController.$inject = ["$scope", "$q", "$timeout"];
