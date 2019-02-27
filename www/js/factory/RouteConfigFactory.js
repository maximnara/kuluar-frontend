(function(){
	var app = angular.module('app');
	
	app.factory('routeConfigFactory', function($rootScope, $state, $timeout, $cordovaGoogleAnalytics) {
		var data = {
			_lastState: undefined
		};
		return {
			'setCalmView': function() {
				$rootScope.isNavBarColorCalm = true;
			},
			'setNormalView': function() {
				$rootScope.isNavBarColorCalm = false;
				$rootScope.isNavBarColorBiege = false;
				$rootScope.isNavBarPostColor = false;
				$rootScope.isNavBarColorInvite = false;
				$rootScope.headerHidden = false;
				$rootScope.navBarBiege = false;
				$rootScope.isNavTitleHoefler = false;
			},
			'setNormalViewOnBack': function() {
				var onStateChange = function(event, toState, toParams, fromState, fromParams){
						$rootScope.isNavBarColorCalm = false;
						$rootScope.isNavBarColorBiege = false;
						$rootScope.isNavBarPostColor = false;
						$rootScope.isNavBarColorInvite = false;
						$rootScope.headerHidden = false;
						$rootScope.navBarBiege = false;
						$rootScope.isNavTitleHoefler = false;
						watcher();
					},
					watcher = $rootScope.$on('$stateChangeStart', onStateChange);
			},
			'setBiegeView': function() {
				$rootScope.isNavBarColorBiege = true;
			},
			'setBiegeViewOnBack': function() {
				var onStateChange = function(event, toState, toParams, fromState, fromParams){
						$timeout(function(){
							$rootScope.isNavBarColorCalm = false;
							$rootScope.isNavBarPostColor = false;
							$rootScope.isNavBarColorInvite = false;
							$rootScope.headerHidden = false;
							$rootScope.navBarBiege = false;
							$rootScope.isNavTitleHoefler = false;
							$rootScope.isNavBarColorBiege = true;
							watcher();
						}, 100);
					},
					watcher = $rootScope.$on('$stateChangeStart', onStateChange);
			},
			'setInviteView': function () {
				$rootScope.isNavBarColorInvite = true;
			},
			'isUserLoggedIn': function() {
				var userId, phoneConfirmed, groupSpecified, groupName, groupType;
				userId = window.localStorage.getItem('userId');
				phoneConfirmed = window.localStorage.getItem('phoneConfirmed');
				groupSpecified = window.localStorage.getItem('groupSpecified');
				groupName = window.localStorage.getItem('groupName');
				groupType = window.localStorage.getItem('groupType');
				if (!userId) {
					return false;
				}
				phoneConfirmed = phoneConfirmed ? parseInt(phoneConfirmed) : 0;
				groupSpecified = groupSpecified ? parseInt(groupSpecified) : 0;
				$rootScope.userId = userId;
				if (userId && phoneConfirmed && groupSpecified) {
					$timeout(function () {
						$state.go('tab.feed');
						$cordovaGoogleAnalytics.setUserId(userId);
					});
					return true;
				}
				if (userId && !!phoneConfirmed && groupName && groupType) {
					/*if (groupType == 1) {
						$state.go('specify-work');
					} else {
						$state.go('specify-study');
					}*/
					$state.go('specify-work');
					return true;
				}
				if (userId && !!phoneConfirmed && !groupSpecified) {
					$timeout(function () {
						$state.go('login');
					});
					return false;
				}
			},
			'setPostColor': function(){
				$rootScope.isNavBarPostColor = true;
			},
			'hideTabs': function(){
				$rootScope.isTabsHidden = true;
			},
			'hideHeaderBar': function(){
				$rootScope.headerHidden = true;
			},
			'showHeaderBar': function(){
				$rootScope.headerHidden = false;
			},
			'showTabsOnBack': function(){
				var onStateChange = function(event, toState, toParams, fromState, fromParams){
						$timeout(function(){
							$rootScope.isTabsHidden = false;
							watcher();
						}, 100);
					},
					watcher = $rootScope.$on('$stateChangeStart', onStateChange);
			},
			'setNavBarBiege': function(){
				$rootScope.navBarBiege = true;
			},
			'setNavBarHoefler': function(){
				$rootScope.isNavTitleHoefler = true;
			}
		};
	})
})();