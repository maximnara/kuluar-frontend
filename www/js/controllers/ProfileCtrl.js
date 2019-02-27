(function(){
	var app = angular.module('app');
	
	app.controller('ProfileCtrl', function($rootScope, $scope, $state, $http, $timeout, $ionicNavBarDelegate, $stateParams, $cordovaFile, $cordovaCamera, $ionicModal, $cordovaKeyboard, $cordovaGoogleAnalytics, $ionicActionSheet, AnonymousService, config, abuse, userBlocked){
		$scope.unlogin = function() {
			window.localStorage.clear();
			$state.go('login');
		};

		$scope.getFromApi = function(userId){
			$http.get(config.apiUrl + 'profile/info', {
				params: {
					userId: userId
				}
			})
				.success(function(data){
					if (!data || data.status == -1) {
						return false;
					}
					$scope.$broadcast();
					$scope.data = data;
				})
				.error(function(){

				});
		};

		$scope.getProfile = function() {
			var userId;
			userId = $scope.userId;
			if (userId == 0) {
				$scope.setAnonymousProfile();
				return true;
			}
			if ($scope.isMyProfile) {
				$scope.setMyProfileName();
			}
			$scope.getFromApi(userId);
		};

		$scope.setAnonymousProfile = function() {
			$scope.data = $scope.anonymousProfile;
		};

		$scope.setMyProfileName = function() {
			$scope.data.name = window.localStorage.getItem('username');
		};

		$scope.getComments = function(){
			$http.get(config.apiUrl + 'profile/getComments', {
				params: {
					userId: window.localStorage.getItem('userId'),
					profileId: $scope.userId
				}
			})
				.success(function(data){
					if (!data || data.status == -1) {
						return false;
					}
					$scope.comments = data;
				})
				.error(function(data){
					console.debug(data);
				});
		};
		$scope.leaveComment = function(){
			$scope.comments.unshift({
				text: $scope.data.comment,
				author: {
					name: window.localStorage.getItem('username')
				},
				isAnonymous: $scope.data.anonymous
			});
			$http.get(config.apiUrl + 'profile/createComment', {
				params: {
					userId: window.localStorage.getItem('userId'),
					text: $scope.data.comment,
					profileId: $scope.userId,
					isAnonymous: $scope.data.anonymous ? $scope.data.anonymous + 0 : 0
				}
			})
				.success(function(data){
					if (!data.hasOwnProperty('status') || data.status !=  1) {
						$scope.comments.shift();
						if (data.hasOwnProperty('user_blocked')) {
							userBlocked.showPopover(data.user_blocked.till);
						}
						return false;
					}
					$scope.data.comment = undefined;
					$scope.getComments();
					if ($scope.data.anonymous) {
						AnonymousService.increment();
					}
				})
				.error(function(data){
					$scope.comments.shift();
				})
				.finally(function(){
					$scope.canShowAnonymousBar = false;
					$scope.closeCommentWindow();
					$cordovaKeyboard.close();
				});
		};

		$scope.chooseImage = function() {

			if (!$scope.isMyProfile) {
				return false;
			}

			var options = {
				quality : 75,
				destinationType : Camera.DestinationType.FILE_URI,
				sourceType : Camera.PictureSourceType.PHOTOLIBRARY,
				allowEdit : true,
				encodingType: Camera.EncodingType.JPEG,
				popoverOptions: CameraPopoverOptions,
				saveToPhotoAlbum: false
			};
			$timeout(function () {
				$cordovaCamera.getPicture(options).then(function (imageData) {
					$scope.selectedImageUrl = imageData;
					$scope.uploadAvatar(imageData);
				}, function () {
				});
			}, 200);
		};

		$scope.uploadAvatar = function(url) {
			$cordovaFile.uploadFile(config.apiUrl + 'file/uploadUserImage', url, {
				params: {
					userId: window.localStorage.getItem('userId'),
					type: 'post'
				}
			})
				.then(function(result) {
					console.debug(result);
				}, function(err) {
					console.debug(err);
				}, function (progress) {

				});
		};

		$scope.canPostComment = function () {
			return (!!$scope.data.comment && !!$scope.data.comment.length) && !($scope.anonymous && !AnonymousService.canBeAnonymous());
		};

		$scope.showMoreComment = function(commentId) {
			$ionicActionSheet.show({
				buttons: [
					{ text: 'Пожаловаться' }
				],
				cancelText: 'Отмена',
				buttonClicked: function(index) {
					if (index == 0) {
						abuse.show(window.localStorage.getItem('userId'), abuse.type.profileComment, commentId);
					}
					return true;
				}
			});
		};

		$ionicModal.fromTemplateUrl('templates/profile/comment-modal.html', {
			scope: $scope,
			animation: 'slide-in-up'
		}).then(function(modal) {
			$scope.modal = modal;
		});

		$scope.openCreateCommentModal = function() {
			$scope.modal.show();
			$scope.$broadcast('focusOnLoad');
		};
		$scope.closeCommentWindow = function() {
			$scope.modal.hide();
			$cordovaKeyboard.close();
		};

		$scope.defaultProfile = {
			avatar: 'img/empty-avatar.png'
		};
		$scope.anonymousProfile = {
			avatar: 'img/anonymous-avatar.png',
			name: 'Неизвестный',
			job: 'Я тот, кто пишет анонимные посты и комментарии. Под моей маской может скрываться любой человек.'
		};
		$scope.privacyTexts = {
			false: 'Публично',
			true: 'Анонимно'
		};
		$scope.anonymous = false;
		$scope.selectedImageUrl = undefined;
		$scope.data = {
			comment: undefined,
			anonymous: false
		};
		$scope.comments = [];
		$scope.userId = $stateParams.id ? $stateParams.id : window.localStorage.getItem('userId');
		$scope.isMyProfile = $scope.userId == window.localStorage.getItem('userId');
		$rootScope.canBeAnonymous = !AnonymousService.canBeAnonymous();
		$scope.getProfile();
		$scope.getComments();
		$ionicNavBarDelegate.setTitle('');
		$timeout(function () {
			$cordovaGoogleAnalytics.trackView('Group member list');
		});
	});
})();