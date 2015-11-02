(function (window, angular, undefined) {

    'use strict';

    angular.module('ts.grid', []);
    angular.module('ts.grid').directive('tsGrid', GridDirective);
    angular.module('ts.grid').directive('tsGridRow', GridRowDirective);

    function GridRowController() {
    }

    function GridController($scope, $parse) {
        this.scope = $scope;
        this.parse_ = $parse;
        this.rows = [
            {name: 'name1', age: 'age1', address: 'address1', country: 'country1'},
            {name: 'name1', age: 'age1', address: 'address1', country: 'country1'}
        ];
        //this.disableCheckboxForRowIf = null;
        //this.showCheckboxForRowIf = null;
        //this.allItemsSelected = false;
        //this.rowControllers = new GridRowController
    }

    GridController.$inject = ["$scope", "$parse"];

    function GridDirective() {
        return {
            restrict: "A",
            controller: GridController,
            controllerAs: "gridCtrl",
            templateUrl: "template/ts.grid.html",
            scope: true,
            compile: function (tElement, tAattr) {
                //if (c[0]) {
                //    c.attr("pan-sort-agent", "sortCtrl");
                //    c.attr("default-sort-key", tAattr.defaultSortKey);
                //    c.attr("second-sort-key", tAattr.secondSortKey);
                //    var d = angular.element('<th ng-if="panTableCtrl.showCheckboxes" class="p6n-col-checkbox"><pan-form-option pan-form-option-type="checkbox"><input type="checkbox" pan-tri-state-checkbox id="headerCheckbox" ng-model="panTableCtrl.allItemsSelected"  ng-change="panTableCtrl.onHeaderCheckboxChanged()"><pan-form-option-label></pan-form-option>');
                //    c.find("tr").prepend(d)
                //}
                //scope, iElement, iAttrs, controller
                return function (scope, iElement, iAttrs, controller) {
                    //iElement.addClass("p6n-table");
                    //controller.initCheckboxSettings_(iAttrs.showCheckboxes, iAttrs.onItemsSelectionChanged, iAttrs.showCheckboxForRowIf, iAttrs.selectedItems, iAttrs.disableCheckboxForRowIf);
                    //scope.$eval(iAttrs.caseSensitive) && iElement.addClass("p6n-case-sensitive-column-headers");
                    //PAN_Xj(iAttrs.fullWidth) && iElement.addClass("p6n-table-full-width")
                }
            }
        }
    }

    function GridRowDirective() {
        return {
            restrict: "C",
            templateUrl: "template/ts.grid.row.html",
            scope: {
                row: '='
            }
        }
    }


})(window, window.angular);