(function(){
	var app = angular.module('app');
	
	app.controller('FeedCtrl', function($rootScope, $scope, $state, $http, $cacheFactory, $timeout, config, localStorageService, routeConfigFactory, $ionicNavBarDelegate, $cordovaGoogleAnalytics){

		var cachedPage, storagedList, getList, ls, storage;

		ls = new localStorageService();
		storage = ls.init('feed');

		cachedPage = {
			'get': function(){
				var page;
				page = window.localStorage.getItem('feed.page');
				return page ? parseInt(page) : 1;
			},
			'set': function(page){
				window.localStorage.setItem('feed.page', page);
			}
		};
		storagedList = {
			'get': function(){
				return storage.get('list');
			},
			'set': function(list){
				storage.set('list', list);
			}
		};
		getList = function(){
			$scope.page = cachedPage.get();
			$scope.list = storagedList.get();
			if (!$scope.list)
				$scope.get($scope.page);
			else {
				routeConfigFactory.setBiegeView();
				routeConfigFactory.setNormalViewOnBack();
			}
		};

		$scope.get = function (page) {
			return $http.get(config.apiUrl + 'feed/get', {
                params: {
                    userId: window.localStorage.getItem('userId'),
	                page: page
                }
            })
				.success(function(data){
					if (data.status == -1 || !data || data.length == 0 || typeof data != 'object'){
						$scope.canScrollMore = false;
						return false;
					}
					$scope.list = $scope.list ? $scope.list : [];
					$scope.list = $scope.list.concat(data);
					if (!page || page == 1){
						$scope.list = data;
						$scope.page = 1;
						cachedPage.set(1);
					}

					if (data.length < 20) {
						$scope.canScrollMore = false;
					}

					storage.set('list', $scope.list);
					storage.remove('needToUpdate');

					routeConfigFactory.setBiegeView();
					routeConfigFactory.setNormalViewOnBack();
				})
				.error(function(data, code){
					console.debug(data, code);
				})
				.finally(function() {
					$scope.$broadcast('scroll.refreshComplete');
				});
		};

		$scope.getItemHeight = function(item) {
			if (item.hasOwnProperty('attachment') && item.attachment.hasOwnProperty('img') && Object.prototype.toString.call(item.attachment.img) == '[object Array]' && item.attachment.img.length > 0 ) {
				return 467;
			}
			return 116;
		};

		$scope.openProfile = function(userId){
			$state.go('tab.profile')
				.then(function(){
					$timeout(function(){
						$state.go('tab.profile', {id: userId});
					}, 100);
				});
		};

		$scope.canScrollMore = true;
		$scope.loadMore = function() {
			var postCount;
			postCount = $scope.list ? $scope.list.length : 0;
			if (!$scope.list || postCount / $scope.page < 20) {
				$scope.$broadcast('scroll.infiniteScrollComplete');
				return false;
			}
			$scope.page += 1;
			cachedPage.set($scope.page);
			$scope
				.get($scope.page)
				.finally(function() {
					$scope.$broadcast('scroll.infiniteScrollComplete');
				});
		};

		$scope.needToUpdate = function(){
			return storage.get('needToUpdate');
		};

        $scope.like = function(id){
	        $scope.list[id].like.liked = true;
	        $scope.list[id].like.count += 1;
            $http.get(config.apiUrl + 'post/like', {
                params: {
                    userId: window.localStorage.getItem('userId'),
                    postId: $scope.list[id].id
                }
            })
                .success(function(data){
                    if (!data || data.status != 1) {
	                    $scope.list[id].like.liked = false;
	                    $scope.list[id].like.count -= 1;
	                    return false;
                    }
                    storage.set('list', $scope.list);
                })
                .error(function (data) {
		            $scope.list[id].like.liked = false;
		            $scope.list[id].like.count -= 1;
                });
        };

		$scope.dislike = function(id){
			$scope.list[id].like.liked = false;
			$scope.list[id].like.count -= 1;
			$http.get(config.apiUrl + 'post/dislike', {
				params: {
					userId: window.localStorage.getItem('userId'),
					postId: $scope.list[id].id
				}
			})
				.success(function(data){
					if (!data || data.status != 1){
						$scope.list[id].like.liked = true;
						$scope.list[id].like.count += 1;
						return false;
					}
                    storage.set('list', $scope.list);
				})
				.error(function (data) {
					$scope.list[id].like.liked = true;
					$scope.list[id].like.count += 1;
					console.debug(data);
				});
		};

		$scope.toggleLike = function(id) {
			if ($scope.list[id].like.liked) {
				return $scope.dislike(id);
			}
			return $scope.like(id);
		};

		$scope.checkCanRefresh = function(){
			if ($scope.list) {
				$scope.$broadcast('scroll.refreshComplete');
			}
		};

		$scope.$watch('needToUpdate()', function(newValue){
			if (newValue == undefined) {
				return false;
			}
			$scope.get();
		});

		getList();
		/*needToUpdate = storage.get('needToUpdate');
		if (list) {
			routeConfigFactory.setBiegeView();
			routeConfigFactory.setNormalViewOnBack();
			$scope.list = list;
		}
        if (needToUpdate || !list){
			$scope.get();
		}*/
		$ionicNavBarDelegate.setTitle('Кулуар');
		$timeout(function () {
			$cordovaGoogleAnalytics.trackView('Feed');
		});
	});
})();