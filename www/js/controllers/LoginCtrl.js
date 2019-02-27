(function(){
	var app = angular.module('app');
	
	app.controller('LoginCtrl', function($rootScope, $scope, $state, $http, $timeout, localStorageService, $cordovaGoogleAnalytics, config, $ionicActionSheet){
		var lsProviders = (new localStorageService()).init('providers').values('data');
		$scope.login = {
			sendInfoToServer: function(provider) {
				var userId = window.localStorage.getItem('userId') || -1,
					token = window.localStorage.getItem('token');
				$http.get(config.apiUrl + 'user/loginBySocials', {params: { provider: provider, userId: userId, token: token }})
					.success(function(data){
						if (data.status == -1) {
							alert(data.message);
							return false;
						}
						$state.go('specify');
					})
					.error(function(data, status){
						alert(JSON.stringify(data));
						alert(status)
					});
			}
		};
		$scope.regions = [
			{
				text: 'Россия',
				prefix: '+7'
			},
			{
				text: 'Украина',
				prefix: '+1'
			},
			{
				text: 'Белоруссия',
				prefix: '+2'
			}
		];
		$scope.selectedRegion = $scope.regions[0].prefix;

		$scope.selectPhoneRegion = function(){
			$ionicActionSheet.show({
				buttons: $scope.regions,
				titleText: 'Выбрать страну',
				cancelText: 'Отменить',
				buttonClicked: function(index) {
					$scope.selectedRegion = $scope.regions[index].prefix;
					return true;
				}
			});
		};

		$scope.sendPhone = function(){
			if (!$scope.phone) {
				$scope.invalidPhone = true;
			}
			$state.go('confirm-phone');
			if (window.localStorage.getItem('confirmationCode')) {
				return false;
			}
			$http.get(config.apiUrl + 'user/new', {
				params: {
					phone: $scope.selectedRegion + $scope.phone
				}
			})
				.success(function(data){
					if (!data || data == -1 || !data.hasOwnProperty('id')){
						$state.go('^');
						return false;
					}
					if (data.hasOwnProperty('name')) {
						window.localStorage.setItem('username', data.name);
					}
					window.localStorage.setItem('userId', data.id);
					window.localStorage.setItem('phone', $scope.selectedRegion + $scope.phone);
					if (data.hasOwnProperty('exists') && data.exists == true) {
						window.localStorage.setItem('userAlreadyExists', 1);
					}
				})
				.error(function(){
					$state.go('^');
				});
		};

		$scope.getSavedPhone = function () {
			var phone;
			phone = window.localStorage.getItem('phone');
			if (phone) {
				return phone.slice(2);
			}
			return null;
		};

		$scope.phone = $scope.getSavedPhone();
		$timeout(function () {
			$cordovaGoogleAnalytics.trackView('Login');
		});
	});
})();