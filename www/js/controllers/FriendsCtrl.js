(function(){
	var app = angular.module('app');
	
	app.controller('FriendsCtrl', function($scope, $state, $http, $ionicScrollDelegate, $ionicNavBarDelegate, $timeout, config, ContactsService, $cordovaGoogleAnalytics, routeConfigFactory){
		$scope.get = function() {
			var userId = window.localStorage.getItem('userId');
			$http.get(config.apiUrl + 'group/getMembers', {
				params: {
					userId: userId
				}
			})
				.success(function(data){
					if (!data || data.status == -1 || data.length == 0 || typeof data != 'object') {
						return false;
					}
					if (!contactBookBlocked) {
						routeConfigFactory.setNavBarBiege();
					}
					$scope.list = data;
					window.localStorage.setItem('groupMembers', JSON.stringify(data));
				})
				.error(function(){

				});
		};

		$scope.pickContact = function() {
			ContactsService.pickContact().then(
				function(contacts) {
					window.localStorage.setItem('contactList', JSON.stringify(contacts));
					window.localStorage.setItem('contactBookBlocked', 0);
					$state.go('tab.invite');
				},
				function(failure) {
					window.localStorage.setItem('contactBookBlocked', 1);
					$scope.contactBookBlocked = true;
				}
			);


		};

		$scope.openProfile = function(userId){
			$state.go('tab.profile')
				.then(function(){
					$timeout(function(){
						$state.go('tab.profile', {id: userId});
					}, 100);
				});
		};

		$timeout(function(){
			if (!contactList || contactBookBlocked == 1) {
				$scope.pickContact();
			}
			if (contactBookBlocked && !$scope.list) {
				//$state.go('tab.invite');
			}
		}, 100);

		var list, contactList, contactBookBlocked;
		list = window.localStorage.getItem('groupMembers');
		contactList = window.localStorage.getItem('contactList');
		contactBookBlocked = window.localStorage.getItem('contactBookBlocked');
		list = list ? JSON.parse(list) : undefined;
		if (list && list.length > 0 && !parseInt(contactBookBlocked)) {
			routeConfigFactory.setNavBarBiege();
		}
		$scope.list = list && list.length > 0 ? list : undefined;
		$scope.contactBookBlocked = !!parseInt(contactBookBlocked);
		$ionicNavBarDelegate.showBackButton(false);
		$scope.get();
		$timeout(function () {
			$cordovaGoogleAnalytics.trackView('Group member list');
		});
	});
})();