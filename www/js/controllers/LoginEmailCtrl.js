(function(){
	var app = angular.module('app');
	
	app.controller('LoginEmailCtrl', function($scope, $state, $http, config){
		$scope.user = {
			mail: undefined,
			password: undefined
		};
		$scope.login = function () {
			console.debug($scope.user.mail, $scope.user.password);
			if ($scope.user.mail == undefined) {
				alert('wrong email');
				return false;
			}
			$http.get(config.apiUrl + 'user/loginByEmail', {params: { userName: $scope.user.mail, password: $scope.user.password }})
				.success(function(data){
					if (data.status == -1) {
						alert(data.message);
						return false;
					}
					window.localStorage.setItem('userId', $scope.user.mail);
					$state.go('specify');
				})
				.error(function(){

				});
		};
	});
})();