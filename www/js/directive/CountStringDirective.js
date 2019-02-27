(function () {
	'use strict';
	var app = angular.module('app');
	app.directive('countString', function () {
        util.sprints = function(string, argArr) {
            var i;
            for (i in argArr) {
                string = string.replace('%s', argArr[i]);
            }
            return string;
        };

        util.get_count_string = function(count, string) {
            var names = string.split('|');
            if (names.length == 2) {
                return count == 1 ? names[0] : names[1];
            }
            count %= 100;
            if (count >= 5 && count <= 20) {
                return names[0];
            }
            count %= 10;
            if (count == 1) {
                return names[1];
            } else if (count < 5 && count != 0) {
                return names[2];
            } else {
                return names[0];
            }
        };

		return {
			restrict: 'E',
			transclude: true,
			replace: true,
			template: '<span></span>',
			scope: { count: '=', names: '@' },
			link: function (scope, elem, attrs) {
				scope.$watch('count', function(count) {
					elem.text(util.sprints(util.get_count_string(count, scope.names), [count]));
				});
			}
		}
	});
})();