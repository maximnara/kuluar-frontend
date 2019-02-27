(function(){
	var app = angular.module('app');

	app.directive('postFooter', function($window, $document) {
		var translate = function(keyboardHeight, resizeContent) {
			ionic.requestAnimationFrame(function() {
				var footer, content;
				footer = $document[0].body.querySelector('.floated-footer-bar');
				content = $document[0].body.querySelector('.scroll');
				if (!footer || !content) {
					return false;
				}
				footer.style[ionic.CSS.TRANSFORM] = 'translate3d(0,-' + keyboardHeight + 'px, 0)';
				//console.debug(resizeContent, angular.element(content));
				if (resizeContent){
					//angular.element(content).height(angular.element(content).height() + 164 + keyboardHeight);
				}
			});
		};

		return {
			restrict: 'C',
			scope: {
				resizeContent: '=?'
			},
			link: function($scope, $element, $attr) {
				var window = angular.element($window);
				window.bind('native.keyboardshow', function(e){
					translate(e.keyboardHeight, $scope.resizeContent);
				});
				window.bind('native.keyboardhide', function(){
					translate(0, $scope.resizeContent);
				});
				$scope.$on('$destroy', function(){
					window.unbind('native.keyboardshow');
					window.unbind('native.keyboardhide');
				});
			}
		}
	});
})();