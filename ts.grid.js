(function (window, angular, undefined) {

    'use strict';

    angular.module('ts.toast', []);
    angular.module('ts.toast').provider('tsToast', ToastProvider);
    angular.module('ts.toast').directive('tsToastList', ToastListDirective);
    angular.module('ts.toast').directive('tsToastMessage', ToastMessageDirective);

    var TOAST_CONTAINER_CONFIGURATION = {
        animation: false,
        messageLimit: 5,
        verticalAlign: "top",
        horizontalAlign: "right",
        maxNumber: 0
    };

    var TOAST_MESSAGE_CONFIGURATION = {
        theme: '',
        icon: false,
        closeOnTimeout: true,
        closeTimeout: 4000,
        showCloseButton: true,
        closeOnClick: false
    };

    /**
     * ToastContainer
     * @param name
     * @param configuration
     * @constructor
     */
    function ToastContainer(name, configuration, messageConfiguration) {
        angular.extend(this, TOAST_CONTAINER_CONFIGURATION, configuration);
        this.name = name;
        this.messageConfiguration = angular.extend({}, TOAST_MESSAGE_CONFIGURATION, messageConfiguration);
        this.messageList = [];
    }

    ToastContainer.prototype.addMessage = function (message) {
        var message = new ToastMessage(message, this.messageConfiguration);
        if (this.verticalAlign == 'top') {
            this.messageList.push(message);
        } else if (this.verticalAlign == 'bottom') {
            this.messageList.unshift(message);
        }
        return message;
    };
    ToastContainer.prototype.removeMessage = function (message) {
        for (var i = this.messageList.length - 1; i >= 0; i--) {
            if (this.messageList[i] === message) {
                this.messageList.splice(i, 1);
                return;
            }
        }
    };
    ToastContainer.prototype.removeAllMessages = function () {
        while (this.messageList.length > 0) {
            if (this.verticalAlign == 'top') {
                this.messageList.pop();
            } else if (this.verticalAlign == 'bottom') {
                this.messageList.shift();
            }
        }
    };

    /**
     * ToastMessage
     * @param message
     * @param configuration
     * @constructor
     */
    function ToastMessage(message, configuration) {
        this.showCloseButton = configuration.showCloseButton;
        this.closeOnClick = configuration.closeOnClick;
        angular.extend(this, configuration, message);
    }

    function ToastProvider() {
        var toastContainerList = {};

        this.configure = function (name, configuration, messageConfiguration) {
            if (toastContainerList[name] !== undefined) {
                throw new Error("Toast container \"" + name + "\" has been configured");
            }
            toastContainerList[name] = new ToastContainer(name, configuration, messageConfiguration);
        };

        this.$get = function () {
            return function (name) {
                if (toastContainerList[name]) {
                    return toastContainerList[name];
                } else {
                    throw new Error("Toast container \"" + name + "\" must be configured");
                }
            };
        };
    }

    ToastProvider.$inject = [];

    function ToastListDirective(tsToast) {
        return {
            replace: true,
            restrict: 'E',
            templateUrl: 'template/ts.toast.list.html',
            scope: {},
            link: function (scope, element, attr) {
                var toastContainer = tsToast(attr.name);
                scope.toast = toastContainer;
                scope.$on("ts:toast:closeMessage", function (event, message) {
                    toastContainer.removeMessage(message)
                });
            }
        };
    }

    ToastListDirective.$inject = ['tsToast'];

    function ToastMessageDirective($timeout) {
        return {
            replace: true,
            restrict: 'E',
            templateUrl: 'template/ts.toast.message.html',
            scope: {
                message: '='
            },
            link: function (scope, element, attr) {

                var timeoutId;

                scope.close = function () {
                    scope.$emit("ts:toast:closeMessage", scope.message);
                };

                var cancelTimeout = function() {
                    $timeout.cancel(timeoutId);
                };

                var startTimeout = function() {
                    if (scope.message.closeOnTimeout) {
                        timeoutId = $timeout(function() {
                            scope.$emit("ts:toast:closeMessage", scope.message);
                        }, scope.message.closeTimeout);
                    }
                };

                scope.onMouseEnter = function() {
                    cancelTimeout();
                };

                scope.onMouseLeave = function() {
                    startTimeout();
                };

                startTimeout();
            }
        };
    }

    ToastMessageDirective.$inject = ['$timeout'];

})(window, window.angular);