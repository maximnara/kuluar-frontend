(function(){
	var app = angular.module('app');
	
	app.factory('mutualFriendsFactory', function($rootScope, $http, config) {
		return {
			'get': function(provider) {
				var userId = window.localStorage.getItem('userId');
				return $http.get(config.apiUrl + 'friend/getMutual', { params: { userId: userId, provider: provider } });
			}
		};
	})
})();