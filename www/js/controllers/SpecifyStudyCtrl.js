(function(){
	var app = angular.module('app');
	
	app.controller('SpecifyStudyCtrl', function($scope, $state, $http, $ionicNavBarDelegate, $stateParams, config){
		$scope.data = {};
		$scope.save = function () {
			var userId = window.localStorage.getItem('userId');
			$http.get(config.apiUrl + 'group/new', {
				params: {
					groupName: $scope.data.groupName,
					userId: userId,
					userName: $scope.data.username,
					type: 2
				}
			})
				.success(function(data){
					if (data.status == -1) {
						return false;
					}
					window.localStorage.setItem('groupSpecified', 1);
					window.localStorage.setItem('username', $scope.data.username);
					$state.go('tab.friends');
				})
				.error(function (data, code) {
					alert(data)
				});
		};
		$scope.data.groupName = window.localStorage.getItem('groupName');
		$scope.data.groupId = window.localStorage.getItem('groupId');
		$scope.username = '';
	});
})();