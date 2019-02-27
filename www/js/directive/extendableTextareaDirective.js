(function(){
	var app = angular.module('app');

	app.directive('extendableTextarea', function() {

		return {
			restrict: 'A',
			require: 'ngModel',
			scope: {
				'etMax': '@?'
			},
			link: function($scope, $element, $attr, ngModel) {
				var rowCount, maxIncrement, initialHeight, canIncrementMore;
				rowCount = 1;
				maxIncrement = 0;
				initialHeight = $element[0].clientHeight;
				canIncrementMore = true;
				$element.bind("keyup", function(e) {
					var clientHeight, scrollHeight, rows;
					rows = rowCount;
					clientHeight = $element[0].clientHeight;
					angular.element($element).css('height', 0 + 'px');
					scrollHeight = $element[0].scrollHeight;

					if (scrollHeight > clientHeight) {
						rows += 1;
					}
					if (scrollHeight < clientHeight) {
						rows -= 1;
					}
					if (rows == $scope.etMax - 1) {
						canIncrementMore = false;
					}
					if (rows > $scope.etMax - 1) {
						angular.element($element).css('height', initialHeight + maxIncrement  + 'px');
						return false;
					}
					if (scrollHeight > clientHeight && canIncrementMore && rows <= $scope.etMax) {
						maxIncrement += scrollHeight - clientHeight;
					}
					rowCount = rows;
					angular.element($element).css('height', scrollHeight  + 'px');
				});
			}
		}
	});
})();