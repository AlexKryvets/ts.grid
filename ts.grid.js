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
        this.row = $scope.row;
        this.$filter = $filter;
        this.$parse = $parse;
    }

    GridRowController.$inject = ["$scope", "$filter", "$parse"];
    GridRowController.prototype.getColumnValue = function (columnName) {
        var value = this.$parse(columnName)(this.row);
        if (value instanceof Date) {
            value = this.$filter('date')(value, "yyyy-MM-dd HH:mm");
        }
        return value;
    }
    GridRowController.prototype.onDblClick = function (row) {
        console.log(this.row);
    }

    function GridController($scope) {
        this.$scope = $scope;
        this.page = 0;
        this.name = $scope.name;
        this.model = $scope.model;
        this.configuration = angular.extend({}, GRID_CONFIGURATION, $scope.configuration);
        this.modelParameters = {
            limit: this.configuration.limit
        };
        this.getDataByPage(this.page);
        this.disableCheckboxForRowIf = null;
        this.showCheckboxForRowIf = null;
        this.allItemsSelected = false;
        angular.extend($scope.expose, {
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
            offset: this.configuration.limit * (page >= 0 ? page : 0)
        });

        var promise = this.model.getGridData(this.modelParameters);
        this.$scope.$emit("ts:grid:" + (this.name ? this.name + ":" : "")  + "load-start", promise);
        this.data = [];
        promise.then(function (data) {
            this.data = data;
            this.totalCount = data.totalCount;
        }.bind(this));
        promise.finally(function () {
            this.$scope.$emit("ts:grid:load-end");
        }.bind(this));
        return promise;
    };
    GridController.$inject = ["$scope", "$parse"];

    function GridDirective() {
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
                        $('.ts-grid-body').height($('.ts-grid').height() - $('.ts-grid-header').height() - $('.ts-grid-pager').height());
                    };
                    var refreshWidth = function () {
                        $('.ts-grid-body .ts-grid-table').width($('.ts-grid-header .ts-grid-table').width());
                    };

                    scope.$on("ts:grid:load-end", function () {
                        refreshHeight();
                        refreshWidth();
                    });

                    $(window).on('resize', function () {
                        refreshHeight();
                        refreshWidth();
                    });
                    $('.ts-grid-body').on('scroll', function (event) {
                        $('.ts-grid-header').scrollLeft(event.target.scrollLeft);
                    });
                }
            }
        }
    }

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
        var length = Math.ceil(this.gridCtrl.totalCount / this.$scope.configuration.limit);
        return Array.apply(null, {length: length}).map(Number.call, Number);
    }
    GridPagerController.prototype.goToPage = function (pageNumber) {
        if (pageNumber >=0 && this.getPageNumbers().length > pageNumber && this.gridCtrl.page != pageNumber) {
            this.gridCtrl.page = pageNumber
            this.gridCtrl.getDataByPage(pageNumber);
        }
    }
    GridPagerController.$inject = ["$scope"];


})(window, window.angular);