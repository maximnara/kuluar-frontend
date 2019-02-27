(function(){
	var app;
	app = angular.module('app');
	app.service('userBlocked', function ($rootScope, $ionicPopover, $filter) {
		this.showPopover = function (dateTill) {
			$ionicPopover.fromTemplateUrl('templates/blocked-modal.html', {
				scope: $rootScope
			}).then(function (popover) {
				$rootScope.blockedUserPopover = popover;
				$rootScope.blockedUserPopover.date = $filter('date')(parseInt(dateTill) * 1000, 'dd.MM.yyyy');
				$rootScope.blockedUserPopover.show();
			});
		};
	});
})();