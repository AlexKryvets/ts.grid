(function (window, angular, undefined) {

    'use strict';

    angular.module('ts.grid', []);
    angular.module('ts.grid').directive('tsGrid', GridDirective);
    angular.module('ts.grid').directive('tsGridPager', GridPagerDirective);

    var GRID_CONFIGURATION = {
        limit: 50
    };

    function abstractMethod() {}

    function GridDelegate() {
        this.onCreate = abstractMethod;
        this.onRowSelect = abstractMethod;
        this.onRowClick = abstractMethod;
        this.onRowDoubleClick = abstractMethod;
        this.onGetDataStart = abstractMethod;
        this.onGetDataEnd = abstractMethod;
    }

    function GridController($scope, $parse, dateFilter) {
        this.$scope = $scope;
        this.$parse = $parse;
        this.dateFilter = dateFilter;

        this.page = 0;
        this.pageCount = 1;
        this.modelParameters = {};
        this.selectedRows = [];

        this.name = $scope.name;
        this.model = $scope.model;
        this.configuration = angular.extend({}, GRID_CONFIGURATION, $scope.configuration);
        $scope.delegate = angular.extend(new GridDelegate, $scope.delegate);
        angular.extend($scope.expose, {
            refreshSize: function () {
                $scope.refreshSize();
            },
            getData: this.getData.bind(this),
            getDataByPage: this.getDataByPage.bind(this),
            getModelParameters: this.getModelParameters.bind(this),
            selectRowByIndex: this.selectRowByIndex.bind(this)
        });

        $scope.delegate.onCreate(this);
    }
    GridController.$inject = ["$scope", "$parse", "dateFilter"];

    GridController.prototype.getModelParameters = function () {
        return this.modelParameters;
    };

    GridController.prototype.onRowClick = function (event, row) {
        var wasSelected = row.isSelected;
        if (!event.ctrlKey) {
            this.deselectRows();
        }
        row.isSelected = !wasSelected;
        this.selectedRows.push(row);
        this.$scope.delegate.onRowClick(event, row);
        if (!wasSelected) {
            this.$scope.delegate.onRowSelect(row);
        }
    };

    GridController.prototype.onRowDoubleClick = function (event, row) {
        this.$scope.delegate.onRowDoubleClick(event, row);
    };

    GridController.prototype.selectRowByIndex = function (index, isSelected) {
        var select = function (index) {
            var row = this.data[index];
            row.isSelected = !!isSelected;
            this.selectedRows.push(row);
            this.$scope.delegate.onRowSelect(row);
        }.bind(this);

        if (angular.isArray(index)) {
            angular.forEach(index, select);
        } else {
            select(index);
        }

    };

    GridController.prototype.deselectRows = function () {
        for(var i = 0, length = this.selectedRows.length; i < length; i++) {
            this.selectedRows[i].isSelected = false;
        }
        this.selectedRows = [];
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
            this.$scope.delegate.onGetDataEnd(this.data);
        }.bind(this));
        return promise;
    };

    GridController.prototype.getDataByPage = function (page) {
        this.page = page;
        return this.getData();
    };

    GridController.prototype.getColumnValue = function (columnName, row) {
        var value = this.$parse(columnName)(row);
        if (value instanceof Date) {
            value = this.dateFilter(value, "yyyy-MM-dd HH:mm");
        }
        return value;
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
                        var gridBody = iElement.find('.ts-grid-body');
                        var gridTableBody = iElement.find('.ts-grid-body .ts-grid-table');
                        if (gridBody[0].scrollHeight > gridBody.height()) {
                            gridTableBody.width(iElement.find('.ts-grid-header .ts-grid-table').width());
                        } else {
                            gridTableBody.width(iElement.find('.ts-grid-header').width());
                        }
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