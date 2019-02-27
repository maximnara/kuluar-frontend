(function(){
	var app = angular.module('app');
	
	app.controller('PostCtrl', function($scope, $rootScope, $http, config, $ionicScrollDelegate, $stateParams, $timeout, $ionicNavBarDelegate, localStorageService, $cordovaCamera, $cordovaFile, $sce, $ionicLoading, $ionicPopover, $ionicActionSheet, $cordovaGoogleAnalytics, routeConfigFactory, AnonymousService, abuse, userBlocked){
		var ls, storage, list, featurePostCreateUsed;
		ls = new localStorageService();
		storage = ls.init('feed');
		list = storage.get('list');
		featurePostCreateUsed = window.localStorage.getItem('featurePostCreateUsed');

		$scope.comments = [];
		$scope.privacyTexts = {
			false: 'Публично',
			true: 'Анонимно'
		};
		$scope.anonymous = false;
		$scope.postMessage = undefined;
		$scope.canShowAnonymousBar = false;
		$scope.imageErrorOccurred = false;

		$rootScope.canBeAnonymous = !AnonymousService.canBeAnonymous();
		$scope.toggleAnonymous = function(){
			if (!AnonymousService.canBeAnonymous()) {
				return false;
			}
			$scope.anonymous = !$scope.anonymous;
		};
		$scope.createPost = function(){
			if (!$scope.canPost()) {
				return false;
			}
			$ionicLoading.show({
				template: '<svg viewBox="0 0 64 64" style="stroke: #fff;width: 25px;"><g stroke-width="4" stroke-linecap="round"><line y1="17" y2="29" transform="translate(32,32) rotate(180)"><animate attributeName="stroke-opacity" dur="750ms" values="1;.85;.7;.65;.55;.45;.35;.25;.15;.1;0;1" repeatCount="indefinite"></animate></line><line y1="17" y2="29" transform="translate(32,32) rotate(210)"><animate attributeName="stroke-opacity" dur="750ms" values="0;1;.85;.7;.65;.55;.45;.35;.25;.15;.1;0" repeatCount="indefinite"></animate></line><line y1="17" y2="29" transform="translate(32,32) rotate(240)"><animate attributeName="stroke-opacity" dur="750ms" values=".1;0;1;.85;.7;.65;.55;.45;.35;.25;.15;.1" repeatCount="indefinite"></animate></line><line y1="17" y2="29" transform="translate(32,32) rotate(270)"><animate attributeName="stroke-opacity" dur="750ms" values=".15;.1;0;1;.85;.7;.65;.55;.45;.35;.25;.15" repeatCount="indefinite"></animate></line><line y1="17" y2="29" transform="translate(32,32) rotate(300)"><animate attributeName="stroke-opacity" dur="750ms" values=".25;.15;.1;0;1;.85;.7;.65;.55;.45;.35;.25" repeatCount="indefinite"></animate></line><line y1="17" y2="29" transform="translate(32,32) rotate(330)"><animate attributeName="stroke-opacity" dur="750ms" values=".35;.25;.15;.1;0;1;.85;.7;.65;.55;.45;.35" repeatCount="indefinite"></animate></line><line y1="17" y2="29" transform="translate(32,32) rotate(0)"><animate attributeName="stroke-opacity" dur="750ms" values=".45;.35;.25;.15;.1;0;1;.85;.7;.65;.55;.45" repeatCount="indefinite"></animate></line><line y1="17" y2="29" transform="translate(32,32) rotate(30)"><animate attributeName="stroke-opacity" dur="750ms" values=".55;.45;.35;.25;.15;.1;0;1;.85;.7;.65;.55" repeatCount="indefinite"></animate></line><line y1="17" y2="29" transform="translate(32,32) rotate(60)"><animate attributeName="stroke-opacity" dur="750ms" values=".65;.55;.45;.35;.25;.15;.1;0;1;.85;.7;.65" repeatCount="indefinite"></animate></line><line y1="17" y2="29" transform="translate(32,32) rotate(90)"><animate attributeName="stroke-opacity" dur="750ms" values=".7;.65;.55;.45;.35;.25;.15;.1;0;1;.85;.7" repeatCount="indefinite"></animate></line><line y1="17" y2="29" transform="translate(32,32) rotate(120)"><animate attributeName="stroke-opacity" dur="750ms" values=".85;.7;.65;.55;.45;.35;.25;.15;.1;0;1;.85" repeatCount="indefinite"></animate></line><line y1="17" y2="29" transform="translate(32,32) rotate(150)"><animate attributeName="stroke-opacity" dur="750ms" values="1;.85;.7;.65;.55;.45;.35;.25;.15;.1;0;1" repeatCount="indefinite"></animate></line></g></svg>',
				noBackdrop: true
			});
			$http.get(config.apiUrl + 'feed/createPost', {
				params: {
					userId: window.localStorage.getItem('userId'),
					text: $scope.postMessage,
					isAnonymous: $scope.anonymous + 0,
					attachment: $scope.attachmentId
				}
			}).success(function(data){
				if (!data || data.status == -1){
					if (data.hasOwnProperty('user_blocked')) {
						userBlocked.showPopover(data.user_blocked.till);
					}
					return false;
				}
				if ($scope.anonymous) {
					AnonymousService.increment();
				}
				$scope.postMessage = undefined;
				$scope.selectedImageUrl = undefined;
				$scope.attachmentId = undefined;
				storage.set('needToUpdate', 1);
				$rootScope.closePostWindow();
				$ionicScrollDelegate.scrollTop(true);
			}).error(function(){

			})
				.finally(function(){
					$ionicLoading.hide();
				});
		};

		$scope.canPost = function () {
			return ((!!$scope.postMessage && !!$scope.postMessage.length && $scope.postMessage.length <= 200) || (!!$scope.attachmentId && !!$scope.attachmentId.length)) && !$scope.getIsImgUploading() && !($scope.anonymous && !AnonymousService.canBeAnonymous());
		};

		$scope.getIsImgUploading = function() {
			return $scope.selectedImageUrl && $scope.showProgressBar;
		};

		$scope.chooseImage = function() {
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
				$cordovaCamera.getPicture(options).then(function(imageData) {
					$scope.selectedImageUrl = imageData;
					$scope.uploadImage(imageData);
				}, function(){});
			}, 200);
		};

		$scope.dropImage = function(){
			$scope.selectedImageUrl = undefined;
		};

		$scope.uploadImage = function(url, onError) {
			$scope.showProgressBar = true;
			if (onError && !$scope.imageErrorOccurred) {
				return false;
			}
			$cordovaFile.uploadFile(config.apiUrl + 'file/uploadPostImage', url, {
				params: {
					userId: window.localStorage.getItem('userId'),
					type: 'post'
				}
			})
				.then(function(result) {
					$scope.showProgressBar = false;
					var response = JSON.parse(result.response);
					if (!response || !response.status || response.status != 1) {
						$scope.imageErrorOccurred = true;
						return false;
					}
					$scope.imageErrorOccurred = false;
					$scope.attachmentId = response.id;
				}, function(err) {
					$scope.imageErrorOccurred = true;
				}, function (progress) {
					$scope.imgTotalSize = progress.total;
					$scope.imgUploadedSize = progress.loaded;
				});
		};

		$scope.selectedImageUrl = undefined;

		$scope.getComments = function() {
			$timeout(function () {
				$cordovaGoogleAnalytics.trackView('Post');
			});
			$http.get(config.apiUrl + 'post/getComments', {
				params: {
					userId: window.localStorage.getItem('userId'),
					postId: $scope.post.id
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
			if (!$scope.comment.length) {
				return false;
			}
			$scope.comments.push({
				text: $scope.comment,
				author: {
					name: window.localStorage.getItem('username')
				},
				isAnonymous: $scope.anonymous
			});
			$scope.post.comment.count += 1;
			$ionicLoading.show({
				template: '<svg viewBox="0 0 64 64" style="stroke: #fff;width: 25px;"><g stroke-width="4" stroke-linecap="round"><line y1="17" y2="29" transform="translate(32,32) rotate(180)"><animate attributeName="stroke-opacity" dur="750ms" values="1;.85;.7;.65;.55;.45;.35;.25;.15;.1;0;1" repeatCount="indefinite"></animate></line><line y1="17" y2="29" transform="translate(32,32) rotate(210)"><animate attributeName="stroke-opacity" dur="750ms" values="0;1;.85;.7;.65;.55;.45;.35;.25;.15;.1;0" repeatCount="indefinite"></animate></line><line y1="17" y2="29" transform="translate(32,32) rotate(240)"><animate attributeName="stroke-opacity" dur="750ms" values=".1;0;1;.85;.7;.65;.55;.45;.35;.25;.15;.1" repeatCount="indefinite"></animate></line><line y1="17" y2="29" transform="translate(32,32) rotate(270)"><animate attributeName="stroke-opacity" dur="750ms" values=".15;.1;0;1;.85;.7;.65;.55;.45;.35;.25;.15" repeatCount="indefinite"></animate></line><line y1="17" y2="29" transform="translate(32,32) rotate(300)"><animate attributeName="stroke-opacity" dur="750ms" values=".25;.15;.1;0;1;.85;.7;.65;.55;.45;.35;.25" repeatCount="indefinite"></animate></line><line y1="17" y2="29" transform="translate(32,32) rotate(330)"><animate attributeName="stroke-opacity" dur="750ms" values=".35;.25;.15;.1;0;1;.85;.7;.65;.55;.45;.35" repeatCount="indefinite"></animate></line><line y1="17" y2="29" transform="translate(32,32) rotate(0)"><animate attributeName="stroke-opacity" dur="750ms" values=".45;.35;.25;.15;.1;0;1;.85;.7;.65;.55;.45" repeatCount="indefinite"></animate></line><line y1="17" y2="29" transform="translate(32,32) rotate(30)"><animate attributeName="stroke-opacity" dur="750ms" values=".55;.45;.35;.25;.15;.1;0;1;.85;.7;.65;.55" repeatCount="indefinite"></animate></line><line y1="17" y2="29" transform="translate(32,32) rotate(60)"><animate attributeName="stroke-opacity" dur="750ms" values=".65;.55;.45;.35;.25;.15;.1;0;1;.85;.7;.65" repeatCount="indefinite"></animate></line><line y1="17" y2="29" transform="translate(32,32) rotate(90)"><animate attributeName="stroke-opacity" dur="750ms" values=".7;.65;.55;.45;.35;.25;.15;.1;0;1;.85;.7" repeatCount="indefinite"></animate></line><line y1="17" y2="29" transform="translate(32,32) rotate(120)"><animate attributeName="stroke-opacity" dur="750ms" values=".85;.7;.65;.55;.45;.35;.25;.15;.1;0;1;.85" repeatCount="indefinite"></animate></line><line y1="17" y2="29" transform="translate(32,32) rotate(150)"><animate attributeName="stroke-opacity" dur="750ms" values="1;.85;.7;.65;.55;.45;.35;.25;.15;.1;0;1" repeatCount="indefinite"></animate></line></g></svg>',
				noBackdrop: true
			});
			$http.get(config.apiUrl + 'post/createComment', {
				params: {
					userId: window.localStorage.getItem('userId'),
					text: $scope.comment,
					postId: $scope.post.id,
					isAnonymous: $scope.anonymous + 0
				}
			})
				.success(function(data){
					if (!data || data.status != 1) {
						$scope.post.comment.count -= 1;
						if (data.hasOwnProperty('user_blocked')) {
							userBlocked.showPopover(data.user_blocked.till);
						}
						return false;
					}
					if ($scope.anonymous) {
						AnonymousService.increment();
					}
					$scope.comment = undefined;
					$scope.$broadcast('textarea.setDefault');
					storage.set('needToUpdate', 1);
				})
				.error(function(data){
					$scope.post.comment.count -= 1;
				})
				.finally(function(){
					$scope.anonymous = false;
					$scope.getComments($scope.post.id);
					$scope.hideAnonymousBar();
					$ionicLoading.hide();
				});
		};
		$scope.commentInputFocused = function(){
			//$ionicScrollDelegate.resize();
			//$ionicScrollDelegate.scrollBottom();
			$scope.showAnonymousBar();
		};
		$scope.showAnonymousBar = function() {
			if ($scope.canShowAnonymousBar) {
				return false;
			}
			$scope.canShowAnonymousBar = true;
			return true;
		};
		$scope.hideAnonymousBar = function() {
			$scope.canShowAnonymousBar = false;
		};
		$scope.setPostData = function(id){
			if (!list || !list.hasOwnProperty(id)) {
				$ionicNavBarDelegate.back();
			}
			$scope.post = list[id];
			$scope.postTitle = $sce.trustAsHtml('<div class="author">'+$scope.post.author.name+'</div><div class="date">'+$scope.post.date+'</div>');
        };
        $scope.like = function(id){
            $scope.post.like.liked = true;
            $scope.post.like.count += 1;
            $http.get(config.apiUrl + 'post/like', {
                params: {
                    userId: window.localStorage.getItem('userId'),
                    postId: id
                }
            })
                .success(function(data){
                    if (!data || data.status == -1) {
                        $scope.post.like.liked = false;
                        $scope.post.like.count -= 1;
                        return false;
                    }
                    storage.set('needToUpdate', 1);
                })
                .error(function (data) {
                    $scope.post.like.liked = false;
                    $scope.post.like.count -= 1;
                });
        };

        $scope.dislike = function(id){
            $scope.post.like.liked = false;
            $scope.post.like.count -= 1;
            $http.get(config.apiUrl + 'post/dislike', {
                params: {
                    userId: window.localStorage.getItem('userId'),
                    postId: id
                }
            })
                .success(function(data){
                    if (!data || data.status == -1){
                        $scope.post.like.liked = true;
                        $scope.post.like.count += 1;
                        return false;
                    }
                    storage.set('needToUpdate', 1);
                })
                .error(function (data) {
                    $scope.post.like.liked = true;
                    $scope.post.like.count += 1;
                });
        };

        $scope.toggleLike = function(id) {
            if ($scope.post.like.liked) {
                return $scope.dislike(id);
            }
            return $scope.like(id);
        };

		$scope.goBack = function() {
			$ionicNavBarDelegate.back();
		};

		$scope.showMore = function () {
			$ionicActionSheet.show({
				buttons: [
					{ text: 'Пожаловаться' }
				],
				cancelText: 'Отмена',
				buttonClicked: function(index) {
					if (index == 0) {
						abuse.show(window.localStorage.getItem('userId'), abuse.type.post, $scope.post.id);
					}
					return true;
				}
			});
		};

		$scope.showMoreComment = function(commentId) {
			$ionicActionSheet.show({
				buttons: [
					{ text: 'Пожаловаться' }
				],
				cancelText: 'Отмена',
				buttonClicked: function(index) {
					if (index == 0) {
						abuse.show(window.localStorage.getItem('userId'), abuse.type.comment, commentId);
					}
					return true;
				}
			});
		};

		$scope.num2str = function(n, texts) {
			n      = Math.abs(n) % 100;
			var n1 = n % 10;

			if (n > 10 && n < 20) {
				return texts[2];
			}

			if (n1 > 1 && n1 < 5) {
				return texts[1];
			}

			if (n1 == 1) {
				return texts[0];
			}

			return texts[2];
		};

		if ($stateParams.hasOwnProperty('postId')) {
			$scope.setPostData($stateParams.postId);
			$scope.getComments();
		}
	});
})();