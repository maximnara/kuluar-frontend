(function () {
	var app = angular.module('app');

	app.directive('focusOnLoad', function($timeout) {
		return {
			link: function(scope, element, attrs) {
				var timer;
				if (!attrs.focusOnLoad || attrs.focusOnLoad.length == 0) {
					timer =  $timeout(function(){
						element[0].focus();
					}, 750);
				}
				scope.$on('focusOnLoad', function() {
					$timeout.cancel(timer);
					$timeout(function(){
						element[0].focus();
					});
				});
			}
		};
	});
})();