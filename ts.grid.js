(function (window, angular, undefined) {

    'use strict';

    angular.module('ts.table', []);
    angular.module('ts.table').directive('tsTable', GridDirective);

    function GridRowController() {
    }

    function GridController($scope, $parse) {
        this.scope = $scope;
        this.parse_ = $parse;
        this.disableCheckboxForRowIf = null;
        this.showCheckboxForRowIf = null;
        this.allItemsSelected = false;
        this.rowControllers = new GridRowController
    }
    GridController.$inject = ["$scope", "$parse"];

    function GridDirective() {
        return {
            restrict: "A",
            controller: GridController,
            controllerAs: "panTableCtrl",
            scope: true,
            compile: function (tElement,tAattr) {
                var c = tElement.find("thead");
                //if (c[0]) {
                //    c.attr("pan-sort-agent", "sortCtrl");
                //    c.attr("default-sort-key", tAattr.defaultSortKey);
                //    c.attr("second-sort-key", tAattr.secondSortKey);
                //    var d = angular.element('<th ng-if="panTableCtrl.showCheckboxes" class="p6n-col-checkbox"><pan-form-option pan-form-option-type="checkbox"><input type="checkbox" pan-tri-state-checkbox id="headerCheckbox" ng-model="panTableCtrl.allItemsSelected"  ng-change="panTableCtrl.onHeaderCheckboxChanged()"><pan-form-option-label></pan-form-option>');
                //    c.find("tr").prepend(d)
                //}
                //scope, iElement, iAttrs, controller
                return function (scope, iElement, iAttrs, controller) {

                    var $colResizers = iElement.find('.col-resizer');

                    $colResizers.on('mousedown', function (event) {
                        var $th = $(this).parent('th');
                        var $colResizer =  $(this);
                        var clientX = event.clientX;
                        iElement.on('mousemove', function (event) {
                            try{
                                var deltaClientX = clientX - event.clientX;
                                $th.width($th.width() - deltaClientX);
                                clientX = event.clientX;
                            } catch (e) {

                            }
                        });
                        iElement.one('mouseup', function (event) {
                            $colResizer.off('mousemove');
                            $th = null;
                        });
                        iElement.one('mouseleave', function (event) {
                            $colResizer.off('mousemove');
                            $th = null;
                        });
                    });

                    //iElement.addClass("p6n-table");
                    //controller.initCheckboxSettings_(iAttrs.showCheckboxes, iAttrs.onItemsSelectionChanged, iAttrs.showCheckboxForRowIf, iAttrs.selectedItems, iAttrs.disableCheckboxForRowIf);
                    //scope.$eval(iAttrs.caseSensitive) && iElement.addClass("p6n-case-sensitive-column-headers");
                    //PAN_Xj(iAttrs.fullWidth) && iElement.addClass("p6n-table-full-width")
                }
            }
        }
    }


})(window, window.angular);