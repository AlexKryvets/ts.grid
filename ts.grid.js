(function (window, angular, undefined) {

    'use strict';

    angular.module('ts.grid', []);
    angular.module('ts.grid').directive('tsGrid', GridDirective);
    angular.module('ts.grid').directive('tsGridRow', GridRowDirective);
    angular.module('ts.grid').directive('tsGridPager', GridPagerDirective);

    var GRID_CONFIGURATION = {
        limit: 50
    };

    var delegateInterface = {
        onCreate: angular.noop,
        onRowClick: angular.noop,
        onRowDoubleClick: angular.noop,
        onGetDataStart: angular.noop
    }

    function GridController($scope) {
        this.$scope = $scope;
        this.page = 0;
        this.name = $scope.name;
        this.model = $scope.model;
        this.configuration = angular.extend({}, GRID_CONFIGURATION, $scope.configuration);
        $scope.delegate = angular.extend({}, delegateInterface, $scope.delegate);
        this.pageCount = 1;
        this.modelParameters = {};
        this.selectedRows = [];
        angular.extend($scope.expose, {
            getData: this.getData.bind(this),
            getDataByPage: this.getDataByPage.bind(this),
            getModelParameters: this.getModelParameters.bind(this)
        });
        $scope.delegate.onCreate();
    }
    GridController.$inject = ["$scope", "$parse"];

    GridController.prototype.getModelParameters = function () {
        return this.modelParameters;
    };

    GridController.prototype.selectRow = function (event, rowCtrl) {
        if (!event.ctrlKey) {
            for(var i = 0, length = this.selectedRows.length; i < length; i++) {
                var selectedRow = this.selectedRows[i];
                if (selectedRow instanceof GridRowController) {
                    selectedRow.isSelected = false;
                }
            }
            this.selectedRows = [];
        }
        this.selectedRows.push(rowCtrl);
    };

    GridController.prototype.getData = function () {
        if (this.configuration.limit === false) {
            delete this.modelParameters.limit;
            delete this.modelParameters.offset;
        } else {
            this.modelParameters.limit = this.configuration.limit;
            this.modelParameters.offset = this.configuration.limit * (this.page >= 0 ? this.page : 0);
        }
        var promise = this.model.getGridData(this.modelParameters);
        this.$scope.delegate.onGetDataStart(promise);
        this.data = [];
        promise.then(function (data) {
            this.data = data;
            this.totalCount = data.totalCount;
            this.pageCount = Math.ceil(this.totalCount / this.configuration.limit);
            this.$scope.refreshSize();
        }.bind(this));
        promise.finally(function () {
        }.bind(this));
        return promise;
    };

    GridController.prototype.getDataByPage = function (page) {
        this.page = page;
        return this.getData();
    };

    function GridRowController($scope, $filter, $parse) {
        this.$scope = $scope;
        this.$filter = $filter;
        this.$parse = $parse;
        this.gridCtrl = $scope.gridCtrl;
        this.row = $scope.row;
        this.index = $scope.index;
        this.isSelected = false;
    }
    GridRowController.$inject = ["$scope", "$filter", "$parse"];

    GridRowController.prototype.getColumnValue = function (columnName) {
        var value = this.$parse(columnName)(this.row);
        if (value instanceof Date) {
            value = this.$filter('date')(value, "yyyy-MM-dd HH:mm");
        }
        return value;
    };

    GridRowController.prototype.onDblClick = function (event) {
        this.isSelected = true;
        this.gridCtrl.selectRow(event, this);
        this.$scope.delegate.onRowDoubleClick(event, this.row);
    };

    GridRowController.prototype.onClick = function (event) {
        this.isSelected = !this.isSelected;
        this.gridCtrl.selectRow(event, this);
        this.$scope.delegate.onRowClick(event, this.row);
    };

    function GridPagerController($scope) {
        this.$scope = $scope;
        this.gridCtrl = $scope.gridCtrl;
    }
    GridPagerController.$inject = ["$scope"];

    GridPagerController.prototype.getPageNumbers = function () {
        return Array.apply(null, {length: this.gridCtrl.pageCount}).map(Number.call, Number);
    };

    GridPagerController.prototype.goToPage = function (pageNumber) {
        if (pageNumber >=0 && this.getPageNumbers().length > pageNumber && this.gridCtrl.page != pageNumber) {
            this.gridCtrl.page = pageNumber
            this.gridCtrl.getDataByPage(pageNumber);
        }
    };

    function GridDirective($timeout) {
        return {
            restrict: "A",
            controller: GridController,
            controllerAs: "gridCtrl",
            templateUrl: "template/ts.grid.html",
            scope: {
                name: "@tsGrid",
                expose: "=",
                model: "=",
                configuration: "=",
                delegate: "="
            },
            compile: function (tElement, tAttr) {
                return function (scope, iElement, iAttrs, controller) {
                    var refreshHeight = function () {
                        iElement.find('.ts-grid-body').height(iElement.find('.ts-grid').height() - iElement.find('.ts-grid-header').height() - iElement.find('.ts-grid-pager').height());
                    };
                    var refreshWidth = function () {
                        iElement.find('.ts-grid-body .ts-grid-table').width(iElement.find('.ts-grid-header .ts-grid-table').width());
                    };
                    var refreshSize = function () {
                        $timeout(function () {
                            refreshHeight();
                            refreshWidth();
                        });
                    };

                    scope.refreshSize = function () {
                        refreshSize();
                    };

                    $(window).on('resize', function () {
                        refreshSize();
                    });
                    $('.ts-grid-body').on('scroll', function (event) {
                        $('.ts-grid-header').scrollLeft(event.target.scrollLeft);
                    });
                }
            }
        }
    }
    GridDirective.$inject = ["$timeout"];

    function GridRowDirective() {
        return {
            replace: true,
            restrict: "C",
            controller: GridRowController,
            controllerAs: "gridRowCtrl",
            templateUrl: "template/ts.grid.row.html"
        }
    }

    function GridPagerDirective() {
        return {
            replace: true,
            restrict: "A",
            controller: GridPagerController,
            controllerAs: "gridPagerCtrl",
            templateUrl: "template/ts.grid.pager.html"

        }
    }
})(window, window.angular);