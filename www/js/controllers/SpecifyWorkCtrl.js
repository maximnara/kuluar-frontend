(function(){
	var app = angular.module('app');
	
	app.controller('SpecifyWorkCtrl', function($scope, $state, $http, $ionicNavBarDelegate, $stateParams, $cordovaPush, $timeout, $ionicLoading, $cordovaGoogleAnalytics, config){
		$scope.data = {};
		$scope.save = function ($form) {
			$form.$submitted = true;
			if (!$form.$valid) {
				return false;
			}
			var userId = window.localStorage.getItem('userId');
			$ionicLoading.show({
				template: '<svg viewBox="0 0 64 64" style="stroke: #fff;width: 25px;"><g stroke-width="4" stroke-linecap="round"><line y1="17" y2="29" transform="translate(32,32) rotate(180)"><animate attributeName="stroke-opacity" dur="750ms" values="1;.85;.7;.65;.55;.45;.35;.25;.15;.1;0;1" repeatCount="indefinite"></animate></line><line y1="17" y2="29" transform="translate(32,32) rotate(210)"><animate attributeName="stroke-opacity" dur="750ms" values="0;1;.85;.7;.65;.55;.45;.35;.25;.15;.1;0" repeatCount="indefinite"></animate></line><line y1="17" y2="29" transform="translate(32,32) rotate(240)"><animate attributeName="stroke-opacity" dur="750ms" values=".1;0;1;.85;.7;.65;.55;.45;.35;.25;.15;.1" repeatCount="indefinite"></animate></line><line y1="17" y2="29" transform="translate(32,32) rotate(270)"><animate attributeName="stroke-opacity" dur="750ms" values=".15;.1;0;1;.85;.7;.65;.55;.45;.35;.25;.15" repeatCount="indefinite"></animate></line><line y1="17" y2="29" transform="translate(32,32) rotate(300)"><animate attributeName="stroke-opacity" dur="750ms" values=".25;.15;.1;0;1;.85;.7;.65;.55;.45;.35;.25" repeatCount="indefinite"></animate></line><line y1="17" y2="29" transform="translate(32,32) rotate(330)"><animate attributeName="stroke-opacity" dur="750ms" values=".35;.25;.15;.1;0;1;.85;.7;.65;.55;.45;.35" repeatCount="indefinite"></animate></line><line y1="17" y2="29" transform="translate(32,32) rotate(0)"><animate attributeName="stroke-opacity" dur="750ms" values=".45;.35;.25;.15;.1;0;1;.85;.7;.65;.55;.45" repeatCount="indefinite"></animate></line><line y1="17" y2="29" transform="translate(32,32) rotate(30)"><animate attributeName="stroke-opacity" dur="750ms" values=".55;.45;.35;.25;.15;.1;0;1;.85;.7;.65;.55" repeatCount="indefinite"></animate></line><line y1="17" y2="29" transform="translate(32,32) rotate(60)"><animate attributeName="stroke-opacity" dur="750ms" values=".65;.55;.45;.35;.25;.15;.1;0;1;.85;.7;.65" repeatCount="indefinite"></animate></line><line y1="17" y2="29" transform="translate(32,32) rotate(90)"><animate attributeName="stroke-opacity" dur="750ms" values=".7;.65;.55;.45;.35;.25;.15;.1;0;1;.85;.7" repeatCount="indefinite"></animate></line><line y1="17" y2="29" transform="translate(32,32) rotate(120)"><animate attributeName="stroke-opacity" dur="750ms" values=".85;.7;.65;.55;.45;.35;.25;.15;.1;0;1;.85" repeatCount="indefinite"></animate></line><line y1="17" y2="29" transform="translate(32,32) rotate(150)"><animate attributeName="stroke-opacity" dur="750ms" values="1;.85;.7;.65;.55;.45;.35;.25;.15;.1;0;1" repeatCount="indefinite"></animate></line></g></svg>',
				noBackdrop: true
			});
			$http.get(config.apiUrl + 'group/new', {
				params: {
					groupName: $scope.data.groupName,
					userId: userId,
					userName: $scope.data.username,
					email: $scope.data.email,
					type: 1
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
				.finally(function(){
					$ionicLoading.hide();
				});
		};
		/*$cordovaPush.register({"badge": true, "sound": true, "alert": true}).then(function(token){
			window.localStorage.setItem('token', token);
			$http.get(config.apiUrl + 'user/token', {
				params: {
					userId: window.localStorage.getItem('userId'),
					token: token
				}
			}, function(err){})
		});*/
		$scope.data.groupName = window.localStorage.getItem('groupName');
		$scope.data.groupId = window.localStorage.getItem('groupId');
		$scope.username = '';
		$timeout(function () {
			$cordovaGoogleAnalytics.trackView('Specify work group');
		});
	});
})();