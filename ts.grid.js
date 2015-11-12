(function (window, angular, undefined) {

    'use strict';

    angular.module('ts.grid', []);
    angular.module('ts.grid').directive('tsGrid', GridDirective);
    angular.module('ts.grid').directive('tsGridRow', GridRowDirective);
    angular.module('ts.grid').directive('tsGridPager', GridPagerDirective);

    var GRID_CONFIGURATION = {
        limit: 50
    };

    function GridRowController($scope, $filter, $parse) {
        this.$scope = $scope;
        this.$filter = $filter;
        this.$parse = $parse;
        this.gridCtrl = $scope.gridCtrl;
        this.row = $scope.row;
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
    GridRowController.prototype.onDblClick = function (row) {
        this.$scope.$emit("ts:grid:" + (this.gridCtrl.name ? this.gridCtrl.name + ":" : "")  + "row-dblClick", this.row);
    };
    GridRowController.prototype.onClick = function (event, row) {
        this.isSelected = !this.isSelected;
        this.$scope.$emit("ts:grid:" + (this.gridCtrl.name ? this.gridCtrl.name + ":" : "")  + "row-click", this.row);
    };

    function GridController($scope) {
        this.$scope = $scope;
        this.page = 0;
        this.name = $scope.name;
        this.model = $scope.model;
        this.configuration = angular.extend({}, GRID_CONFIGURATION, $scope.configuration);
        this.pageCount = 1;
        this.modelParameters = {
            limit: this.configuration.limit === false ? undefined : this.configuration.limit
        };
        this.disableCheckboxForRowIf = null;
        this.showCheckboxForRowIf = null;
        this.allItemsSelected = false;
        angular.extend($scope.expose, {
            getDataByPage: this.getDataByPage.bind(this),
            getDataByCurrent: this.getDataByCurrent.bind(this),
            getModelParameters: this.getModelParameters.bind(this)
        });
    }

    GridController.prototype.getModelParameters = function () {
        return this.modelParameters;
    };

    GridController.prototype.getDataByCurrent = function () {
        return this.getDataByPage(this.page);
    };

    GridController.prototype.getDataByPage = function (page) {
        angular.extend(this.modelParameters,{
            offset: this.configuration.limit === false ? undefined : this.configuration.limit * (page >= 0 ? page : 0)
        });

        var promise = this.model.getGridData(this.modelParameters);
        this.$scope.$emit("ts:grid:" + (this.name ? this.name + ":" : "")  + "load-start", promise);
        this.data = [];
        promise.then(function (data) {
            this.data = data;
            this.totalCount = data.totalCount;
            this.pageCount = Math.ceil(this.totalCount / this.configuration.limit);
            this.$scope.refreshSize();
        }.bind(this));
        promise.finally(function () {
            this.$scope.$emit("ts:grid:" + (this.name ? this.name + ":" : "")  + "load-end");
        }.bind(this));
        return promise;
    };
    GridController.$inject = ["$scope", "$parse"];

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
                configuration: "="
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

    function GridPagerController($scope) {
        this.$scope = $scope;
        this.gridCtrl = $scope.gridCtrl;
    }

    GridPagerController.prototype.getPageNumbers = function () {
        return Array.apply(null, {length: this.gridCtrl.pageCount}).map(Number.call, Number);
    }
    GridPagerController.prototype.goToPage = function (pageNumber) {
        if (pageNumber >=0 && this.getPageNumbers().length > pageNumber && this.gridCtrl.page != pageNumber) {
            this.gridCtrl.page = pageNumber
            this.gridCtrl.getDataByPage(pageNumber);
        }
    }
    GridPagerController.$inject = ["$scope"];


})(window, window.angular);