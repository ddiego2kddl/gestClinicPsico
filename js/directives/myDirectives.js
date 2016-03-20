'use strict';

app.directive('ngrange', function() {
    console.log("dfasf");
    return {
        replace: true,
        restrict: 'E',
        require: 'ngModel',
        template: '<input type="range"></input>',
        link: function(scope, element, attrs, ngModel) {
            var ngrangemin;
            var ngrangemax;
            var ngrangestep;
            var value;
            console.log("dfasfa");
            if (!angular.isDefined(attrs.ngrangemin)) {
                ngrangemin = 0;
            } else {
                scope.$watch(attrs.ngrangemin, function(newValue, oldValue, scope) {
                    if (angular.isDefined(newValue)) {
                        ngrangemin = newValue;
                        setValue();
                    }
                });
            }
            if (!angular.isDefined(attrs.ngrangemax)) {
                ngrangemax = 100;
            } else {
                scope.$watch(attrs.ngrangemax, function(newValue, oldValue, scope) {
                    if (angular.isDefined(newValue)) {
                        ngrangemax = newValue;
                        setValue();
                    }
                });
            }
            if (!angular.isDefined(attrs.ngrangestep)) {
                ngrangestep = 1;
            } else {
                scope.$watch(attrs.ngrangestep, function(newValue, oldValue, scope) {
                    if (angular.isDefined(newValue)) {
                        ngrangestep = newValue;
                        setValue();
                    }
                });
            }
            if (!angular.isDefined(ngModel)) {
                value = 50;
            } else {
                scope.$watch(
                    function () {
                        return ngModel.$modelValue;
                    }, 
                    function(newValue, oldValue, scope) {
                        if (angular.isDefined(newValue)) {
                            value = newValue;
                            setValue();
                        }
                    }
                );
            }

            function setValue() {
                if (
                    angular.isDefined(ngrangemin) &&
                    angular.isDefined(ngrangemax) &&
                    angular.isDefined(ngrangestep) &&
                    angular.isDefined(value)
                ) {
                    element.attr("min", ngrangemin);
                    element.attr("max", ngrangemax);
                    element.attr("step", ngrangestep);
                    element.val(value); 
                }
            }

            function read() {
                if (angular.isDefined(ngModel)) {
                    ngModel.$setViewValue(value);
                }
            }

            element.on('change', function() {
                if (angular.isDefined(value) && (value != element.val())) {
                    value = element.val();
                    scope.$apply(read);
                }
            });
        }
    };
});