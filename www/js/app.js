// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('app', ['ionic', 'ngCordova', 'pasvaz.bindonce', 'easypiechart'])

.run(function($ionicPlatform, $rootScope, $ionicModal, $ionicPopover, $timeout, $cordovaGoogleAnalytics) {
  $ionicPlatform.ready(function() {
	  ionic.Platform.isFullScreen = true;
	  ionic.Platform.hasBouncing = true;
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
	if(window.cordova && window.cordova.plugins.Keyboard) {
		cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
		cordova.plugins.Keyboard.disableScroll(true);
	}
    if(window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
	  if (window.analytics) {
		  $cordovaGoogleAnalytics.startTrackerWithId('UA-61727645-1');
	  }
  });
		$rootScope.openCreatePostModal = function() {
			var featurePostCreateUsed;
			featurePostCreateUsed = window.localStorage.getItem('featurePostCreateUsed');
			$ionicModal.fromTemplateUrl('templates/post/modal.html', {
				scope: $rootScope,
				animation: 'slide-in-up'
			}).then(function(modal) {
				$rootScope.modal = modal;
				$rootScope.modal.show();
				if (featurePostCreateUsed) {
					$timeout(function() {
						$rootScope.$broadcast('focusOnLoad');
					});
				}
				if (!featurePostCreateUsed) {
					$ionicPopover.fromTemplateUrl('templates/post/feature.html', {
						scope: $rootScope
					}).then(function (popover) {
						$rootScope.popover = popover;
						$rootScope.popover.show();
					});
				}
				window.localStorage.setItem('featurePostCreateUsed', 1);
				$timeout(function () {
					$cordovaGoogleAnalytics.trackView('Post create');
				});
			});
		};
		$rootScope.closePostWindow = function() {
			$rootScope.modal.hide();
			if(window.cordova && window.cordova.plugins.Keyboard) {
				cordova.plugins.Keyboard.close();
			}
		};
})

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

    // setup an abstract state for the tabs directive
    .state('tab', {
      url: "/tab",
      abstract: true,
      templateUrl: "templates/tabs/tabs.html"
    })

    // Each tab has its own nav history stack:

	  .state('promo', {
		  url: '/promo',
		  templateUrl: 'templates/promo/promo.html',
		  //controller: 'PromoCtrl',
		  resolve: {
			  checkLoggedIn: function($timeout, $cordovaGoogleAnalytics, routeConfigFactory) {
				  routeConfigFactory.isUserLoggedIn();
				  $timeout(function () {
					  $cordovaGoogleAnalytics.trackView('Promo');
				  });
			  }
		  }
	  })

	.state('login', {
		  url: '/login',
		  templateUrl: 'templates/login/login.html',
		  controller: 'LoginCtrl',
		  resolve: {
			  checkLoggedIn: function(routeConfigFactory) {
				  routeConfigFactory.isUserLoggedIn();
			  }
		  }
	})

	  .state('confirm-phone', {
		  url: '/confirm',
		  templateUrl: 'templates/login/confirm-phone.html',
		  controller: 'ConfirmPhoneCtrl'
	  })

	  .state('social', {
		  url: '/social',
		  templateUrl: 'templates/login/login-social.html',
		  controller: 'LoginCtrl'
	  })

	  .state('email', {
		  url: '/email',
		  templateUrl: 'templates/login/login-email.html',
		  controller: 'LoginEmailCtrl'
	  })

	  .state('invite', {
		  url: '/invite',
		  templateUrl: 'templates/login/login-invite.html',
		  controller: 'LoginCtrl'
	  })

	  .state('resetPassword', {
		  url: '/resetPassword',
		  templateUrl: 'templates/login/login-reset-password.html',
		  controller: 'LoginCtrl'
	  })

	  .state('specify', {
		  url: '/specify',
		  templateUrl: 'templates/login/specify/login-specify.html'
	  })

	  .state('specify-work', {
		  url: '/specify/work',
		  templateUrl: 'templates/login/specify/login-specify-work.html',
		  controller: 'SpecifyWorkCtrl'
	  })

	  .state('specify-study', {
		  url: '/specify/study',
		  templateUrl: 'templates/login/specify/login-specify-study.html',
		  controller: 'SpecifyStudyCtrl'
	  })

    .state('tab.friends', {
      url: '/friends',
      views: {
        'tab-friends': {
          templateUrl: 'templates/tabs/tab-friends.html',
          controller: 'FriendsCtrl'
        }
      },
		  resolve: {
			  setCalmView: function(routeConfigFactory){
				  routeConfigFactory.setNavBarHoefler();
				  routeConfigFactory.setNormalViewOnBack();
			  }
		  }
    })

	  .state('tab.invite', {
		  url: '/invite',
		  views: {
			  'tab-friends': {
				  templateUrl: 'templates/invite/invite.html',
				  controller: 'InviteCtrl'
			  }
		  },
		  resolve: {
			  setCalmView: function(routeConfigFactory){
				  //routeConfigFactory.setCalmView();
				  routeConfigFactory.setInviteView();
				  routeConfigFactory.setNormalViewOnBack();
			  }
		  }
	  })

	  .state('tab.feed', {
		  url: '/feed',
		  views: {
			  'tab-feed': {
				  templateUrl: 'templates/tabs/tab-feed.html',
				  controller: 'FeedCtrl'
			  }
		  },
		  resolve: {
			  configRoute: function(routeConfigFactory){
				  routeConfigFactory.setNavBarHoefler();
				  routeConfigFactory.setNormalViewOnBack();
			  }
		  }
	  })

	  .state('tab.post', {
		  url: '/post/:postId',
		  views: {
			  'tab-feed': {
				  templateUrl: 'templates/post/post.html',
				  controller: 'PostCtrl'
			  }
		  },
		  resolve: {
			  setPostColor: function(routeConfigFactory){
				  routeConfigFactory.hideHeaderBar();
				  routeConfigFactory.setNormalViewOnBack();
				  routeConfigFactory.hideTabs();
				  routeConfigFactory.showTabsOnBack();
			  }
		  }
	  })

	  .state('tab.profile', {
		  url: '/profile/{id:[0-9]*}',
		  views: {
			  'tab-profile': {
				  templateUrl: 'templates/tabs/tab-profile.html',
				  controller: 'ProfileCtrl'
			  }
		  },
		  resolve: {
			  setCalmView: function(routeConfigFactory){
				  routeConfigFactory.setNavBarBiege();
				  routeConfigFactory.setNormalViewOnBack();
			  }
		  }
	  });

  $urlRouterProvider.otherwise('/promo');

});

