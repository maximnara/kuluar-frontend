(function(){
	var app = angular.module('app');

	app.controller('ConfirmPhoneCtrl', function($rootScope, $scope, $http, $state, $timeout, $ionicLoading, $cordovaGoogleAnalytics, config){

		$scope.verifyCode = function(){
			if (!$scope.confirmationCode) {
				$scope.codeWrong = true;
				return false;
			}
			$ionicLoading.show({
				template: '<svg viewBox="0 0 64 64" style="stroke: #fff;width: 25px;"><g stroke-width="4" stroke-linecap="round"><line y1="17" y2="29" transform="translate(32,32) rotate(180)"><animate attributeName="stroke-opacity" dur="750ms" values="1;.85;.7;.65;.55;.45;.35;.25;.15;.1;0;1" repeatCount="indefinite"></animate></line><line y1="17" y2="29" transform="translate(32,32) rotate(210)"><animate attributeName="stroke-opacity" dur="750ms" values="0;1;.85;.7;.65;.55;.45;.35;.25;.15;.1;0" repeatCount="indefinite"></animate></line><line y1="17" y2="29" transform="translate(32,32) rotate(240)"><animate attributeName="stroke-opacity" dur="750ms" values=".1;0;1;.85;.7;.65;.55;.45;.35;.25;.15;.1" repeatCount="indefinite"></animate></line><line y1="17" y2="29" transform="translate(32,32) rotate(270)"><animate attributeName="stroke-opacity" dur="750ms" values=".15;.1;0;1;.85;.7;.65;.55;.45;.35;.25;.15" repeatCount="indefinite"></animate></line><line y1="17" y2="29" transform="translate(32,32) rotate(300)"><animate attributeName="stroke-opacity" dur="750ms" values=".25;.15;.1;0;1;.85;.7;.65;.55;.45;.35;.25" repeatCount="indefinite"></animate></line><line y1="17" y2="29" transform="translate(32,32) rotate(330)"><animate attributeName="stroke-opacity" dur="750ms" values=".35;.25;.15;.1;0;1;.85;.7;.65;.55;.45;.35" repeatCount="indefinite"></animate></line><line y1="17" y2="29" transform="translate(32,32) rotate(0)"><animate attributeName="stroke-opacity" dur="750ms" values=".45;.35;.25;.15;.1;0;1;.85;.7;.65;.55;.45" repeatCount="indefinite"></animate></line><line y1="17" y2="29" transform="translate(32,32) rotate(30)"><animate attributeName="stroke-opacity" dur="750ms" values=".55;.45;.35;.25;.15;.1;0;1;.85;.7;.65;.55" repeatCount="indefinite"></animate></line><line y1="17" y2="29" transform="translate(32,32) rotate(60)"><animate attributeName="stroke-opacity" dur="750ms" values=".65;.55;.45;.35;.25;.15;.1;0;1;.85;.7;.65" repeatCount="indefinite"></animate></line><line y1="17" y2="29" transform="translate(32,32) rotate(90)"><animate attributeName="stroke-opacity" dur="750ms" values=".7;.65;.55;.45;.35;.25;.15;.1;0;1;.85;.7" repeatCount="indefinite"></animate></line><line y1="17" y2="29" transform="translate(32,32) rotate(120)"><animate attributeName="stroke-opacity" dur="750ms" values=".85;.7;.65;.55;.45;.35;.25;.15;.1;0;1;.85" repeatCount="indefinite"></animate></line><line y1="17" y2="29" transform="translate(32,32) rotate(150)"><animate attributeName="stroke-opacity" dur="750ms" values="1;.85;.7;.65;.55;.45;.35;.25;.15;.1;0;1" repeatCount="indefinite"></animate></line></g></svg>',
				noBackdrop: true
			});
			$http.get(config.apiUrl + 'user/verify', {
				params: {
					code: $scope.confirmationCode,
					userId: window.localStorage.getItem('userId')
				}
			})
				.success(function(data){
					if (!data || data.status != 1 || data.result != true) {
						$scope.codeWrong = true;
						return false;
					}
					$state.go('specify-work');
					window.localStorage.setItem('phoneConfirmed', 1);
					if (data.hasOwnProperty('group')) {
						window.localStorage.setItem('groupName', data.group.name);
						window.localStorage.setItem('groupId', data.group.id);
						window.localStorage.setItem('groupType', data.group.type);
						window.localStorage.setItem('groupSpecified', 1);
					}
					if (data.hasOwnProperty('exists') && data.exists == true) {
						$state.go('tab.feed');
						if (data.hasOwnProperty('username')) {
							window.localStorage.setItem('username', data.username);
						}
					}
				})
				.finally(function(){
					$ionicLoading.hide();
				});
		};

		$scope.resendCode = function () {
			$http.get(config.apiUrl + 'user/resendcode', {
				params: {
					phone: window.localStorage.getItem('phone')
				}
			})
				.success(function(data){
					if (!data || data.status != 1 || !data.hasOwnProperty('code')) {
						return false;
					}
					window.localStorage.setItem('confirmationCode', data.code);
					window.localStorage.setItem('codeResended', 1)
				});
			$rootScope.codeResended = true;
		};

		$scope.$watch('confirmationCode', function(value){
			if (!value || value.length < 4) {
				$scope.codeWrong = false;
				return false;
			}
			$scope.verifyCode();
		});
		$scope.options = {
			animate:{
				duration:60*1000,
				enabled:true
			},
			trackColor: 'transparent',
			barColor:'#fff',
			scaleColor:false,
			lineWidth:2,
			lineCap:'circle',
			size: 25
		};
		$timeout(function(){
			$scope.canSendAgain = true;
		}, 60*1000);
		$scope.phone = window.localStorage.getItem('phone');
		$scope.confirmationCode = undefined;
		$scope.codeWrong = false;
		$scope.canSendAgain = false;
		$rootScope.codeResended = !!window.localStorage.getItem('codeResended');
		$timeout(function () {
			$cordovaGoogleAnalytics.trackView('Confirm phone');
		});
	});
})();