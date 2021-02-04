angular.module('App', ['ionic', 'ui.router', 'ngCordova', 'ngAnimate', 'ngFileUpload', 'ionic.contrib.ui.cards'])
.controller('TabsCtrl', [
'$rootScope',
'$scope',
'$state',
'$ionicPopover',
'$ionicLoading',
'auth',
function($rootScope, $scope, $state, $ionicPopover, $ionicLoading, auth){
	$scope.show = function() {
		$ionicLoading.show({
			template: '<ion-spinner icon="bubbles" class="spinner-balanced"></ion-spinner>'
		}).then(function(){
			console.log("The loading indicator is now displayed");
		});
	};
	$scope.hide = function(){
		$ionicLoading.hide().then(function(){
			console.log("The loading indicator is now hidden");
		});
	};
	
	$scope.currentUser = $rootScope.currentUser;
	
	$ionicPopover.fromTemplateUrl('views/tabs/tabs-create.html', {
		scope: $scope
	}).then(function(popover) {
		$scope.popover = popover;
	});

	$scope.openCreatePopover = function($event) {
		$scope.popover.show($event);
	};
	
	$scope.closeCreatePopover = function() {
		$scope.popover.hide();
	};
	
	$scope.createCard = function() {
		$state.go('tabs.createCard');
		$scope.closeCreatePopover();
		$scope.hide($ionicLoading);
	};
	$scope.createDeck = function() {
		$state.go('tabs.createDeck');
		$scope.closeCreatePopover();
		$scope.hide($ionicLoading);
	};
	$scope.createCourse = function() {
		$state.go('tabs.createCourse');
		$scope.closeCreatePopover();
		$scope.hide($ionicLoading);
	};
}])

.config(function ($stateProvider, $urlRouterProvider) {
	$stateProvider
	.state('start', {
		url: '/start',
		templateUrl: 'views/auth/start.html',
		controller: 'AuthCtrl',
		onEnter: ['$state', 'auth', function($state, auth){
			if(auth.isLoggedIn()){
				$state.go('tabs.home');
			}
		}]
	})
	.state('getStarted', {
		url: '/start',
		templateUrl: 'views/auth/get-started.html',
		controller: 'AuthCtrl',
		onEnter: ['$state', 'auth', function($state, auth){
			if(auth.isLoggedIn()){
				$state.go('tabs.home');
			}
		}]
	})
	.state('register', {
		url: '/register',
		templateUrl: 'views/auth/register.html',
		controller: 'AuthCtrl',
		onEnter: ['$state', 'auth', function($state, auth){
			if(auth.isLoggedIn()){
				$state.go('tabs.home');
			}
		}]
	})
	.state('login', {
		url: '/login',
		templateUrl: 'views/auth/login.html',
		controller: 'AuthCtrl',
		onEnter: ['$state', 'auth', function($state, auth){
			if(auth.isLoggedIn()){
				$state.go('tabs.home');
			}
		}]
	})
	.state('tabs', {
		url: '/tabs',
		abstract: true,
		templateUrl: 'views/tabs/tabs.html',
		controller: 'TabsCtrl'
	})
	.state('tabs.home', {
		url: '/home',
		views: {
			'home-tab': {
				templateUrl: 'views/home/home.html',
				controller: 'HomeCtrl',
				resolve: {
					user: ['$stateParams', 'cards', function($stateParams, cards){
						return cards.getAll("All", $stateParams.user);
					}]
				}
			}
		}
	})
	.state('tabs.search', {
		url: '/search',
		views: {
			'search-tab': {
				templateUrl: 'views/search/search.html',
				controller: 'SearchCtrl'
			}
		}
	})
	.state('tabs.searchLanguage', {
		url: '/search/results/:language',
		views: {
			'search-tab': {
				templateUrl: 'views/search/search-results.html',
				controller: 'SearchCtrl'
			}
		}
	})
	.state('tabs.searchCategory', {
		url: '/search/results/:category',
		views: {
			'search-tab': {
				templateUrl: 'views/search/search-results.html',
				controller: 'SearchCtrl'
			}
		}
	})
	.state('tabs.searchQuery', {
		url: '/search/results/:query',
		views: {
			'search-tab': {
				templateUrl: 'views/search/search-results.html',
				controller: 'SearchCtrl'
			}
		}
	})
	.state('tabs.searchTopic', {
		url: '/search/results/:topic',
		views: {
			'search-tab': {
				templateUrl: 'views/search/search-results.html',
				controller: 'SearchCtrl'
			}
		}
	})
	.state('tabs.createCard', {
		url: '/create/card',
		views: {
			'create-tab': {
				templateUrl: 'views/create/create-form/create-form.html',
				controller: 'CreateCtrl'
			}
		}
	})
	.state('tabs.createDeck', {
		url: '/create/deck',
		views: {
			'create-tab': {
				templateUrl: 'views/create/create-deck-form.html',
				controller: 'CreateCtrl'
			}
		}
	})
	.state('tabs.createCourse', {
		url: '/create/course',
		views: {
			'create-tab': {
				templateUrl: 'views/create/create-course-form.html',
				controller: 'CreateCtrl'
			}
		}
	})
	.state('tabs.chat', {
		url: '/chat',
		views: {
			'chat-tab': {
				templateUrl: 'views/chat/chat.html',
				controller: 'ChatCtrl'
			}
		}
	})
	.state('tabs.viewChat', {
		url: '/chat/:username',
		views: {
			'chat-tab': {
				templateUrl: 'views/chat/view-chat.html',
				controller: 'ChatCtrl'
			}
		}
	})
	.state('tabs.me', {
		url: '/me/:username',
		views: {
			'me-tab': {
				templateUrl: 'views/profile/profile.html',
				controller: 'MeCtrl',
				resolve: {
					all: ['cards', 'auth', function(cards, auth){
						return cards.getAll("All", auth.currentUser.username);
					}]
				}
			}
		}
	})
	.state('tabs.progress', {
		url: '/progress/:username',
		views: {
			'me-tab': {
				templateUrl: 'views/profile/profile-pages/profile-progress.html',
				controller: 'MeCtrl'
			}
		}
	})
	.state('tabs.badges', {
		url: '/badges/:username',
		views: {
			'me-tab': {
				templateUrl: 'views/profile/profile-pages/profile-badges.html',
				controller: 'MeCtrl'
			}
		}
	})
	.state('tabs.followers', {
		url: '/followers/:username',
		views: {
			'me-tab': {
				templateUrl: 'views/profile/profile-pages/profile-followers.html',
				controller: 'MeCtrl'
			}
		}
	})
	.state('tabs.following', {
		url: '/following/:username',
		views: {
			'me-tab': {
				templateUrl: 'views/profile/profile-pages/profile-following.html',
				controller: 'MeCtrl'
			}
		}
	})

	// VIEW FROM HOME
	.state('tabs.viewCard1', {
		url: '/cards1/:card/',
		views: {
			'home-tab': {
				templateUrl: 'views/profile/view-card/view-card.html',
				controller: 'CardCtrl'
			}
		}
	})
	.state('tabs.viewDeck1', {
		url: '/decks1/:deck/',
		views: {
			'home-tab': {
				templateUrl: 'views/profile/view-deck/view-deck.html',
				controller: 'DeckCourseCtrl'
			}
		}
	})
	.state('tabs.viewCourse1', {
		url: '/courses1/:course/',
		views: {
			'home-tab': {
				templateUrl: 'views/profile/view-course/view-course.html',
				controller: 'DeckCourseCtrl'
			}
		}
	})
	.state('tabs.editCard1', {
		url: '/cards1/:card/edit',
		views: {
			'home-tab': {
				templateUrl: 'views/create/create-form/create-form.html',
				controller: 'CardCtrl'
			}
		}
	})
	.state('tabs.editDeck1', {
		url: '/decks1/:deck/edit',
		views: {
			'home-tab': {
				templateUrl: 'views/profile/edit/edit-deck.html',
				controller: 'DeckCourseCtrl'
			}
		}
	})
	.state('tabs.editCourse1', {
		url: '/courses1/:course/edit',
		views: {
			'home-tab': {
				templateUrl: 'views/profile/edit/edit-course.html',
				controller: 'DeckCourseCtrl'
			}
		}
	})
	
	// VIEW FROM SEARCH
	.state('tabs.viewCard2', {
		url: '/cards2/:card/',
		views: {
			'search-tab': {
				templateUrl: 'views/profile/view-card/view-card.html',
				controller: 'CardCtrl'
			}
		}
	})
	.state('tabs.viewDeck2', {
		url: '/decks2/:deck/',
		views: {
			'search-tab': {
				templateUrl: 'views/profile/view-deck/view-deck.html',
				controller: 'DeckCourseCtrl'
			}
		}
	})
	.state('tabs.viewCourse2', {
		url: '/courses2/:course/',
		views: {
			'search-tab': {
				templateUrl: 'views/profile/view-course/view-course.html',
				controller: 'DeckCourseCtrl'
			}
		}
	})
	.state('tabs.editCard2', {
		url: '/cards2/:card/edit',
		views: {
			'home-tab': {
				templateUrl: 'views/create/create-form/create-form.html',
				controller: 'CardCtrl'
			}
		}
	})
	.state('tabs.editDeck2', {
		url: '/decks2/:deck/edit',
		views: {
			'home-tab': {
				templateUrl: 'views/profile/edit/edit-deck.html',
				controller: 'DeckCourseCtrl'
			}
		}
	})
	.state('tabs.editCourse2', {
		url: '/courses2/:course/edit',
		views: {
			'home-tab': {
				templateUrl: 'views/profile/edit/edit-course.html',
				controller: 'DeckCourseCtrl'
			}
		}
	})
	
	// VIEW FROM ME
	.state('tabs.viewCard3', {
		url: '/cards3/:card/',
		views: {
			'me-tab': {
				templateUrl: 'views/profile/view-card/view-card.html',
				controller: 'CardCtrl'
			}
		}
	})
	.state('tabs.viewDeck3', {
		url: '/decks3/:deck/',
		views: {
			'me-tab': {
				templateUrl: 'views/profile/view-deck/view-deck.html',
				controller: 'DeckCourseCtrl'
			}
		}
	})
	.state('tabs.viewCourse3', {
		url: '/courses3/:course/',
		views: {
			'me-tab': {
				templateUrl: 'views/profile/view-course/view-course.html',
				controller: 'DeckCourseCtrl'
			}
		}
	})
	.state('tabs.editCard3', {
		url: '/cards3/:card/edit',
		views: {
			'home-tab': {
				templateUrl: 'views/create/create-form/create-form.html',
				controller: 'CardCtrl'
			}
		}
	})
	.state('tabs.editDeck3', {
		url: '/decks3/:deck/edit',
		views: {
			'home-tab': {
				templateUrl: 'views/profile/edit/edit-deck.html',
				controller: 'DeckCourseCtrl'
			}
		}
	})
	.state('tabs.editCourse3', {
		url: '/courses3/:course/edit',
		views: {
			'home-tab': {
				templateUrl: 'views/profile/edit/edit-course.html',
				controller: 'DeckCourseCtrl'
			}
		}
	})
	.state('tabs.notifications', {
		url: '/notifications',
		views: {
			'me-tab': {
				templateUrl: 'views/profile/profile-pages/profile-notifications.html',
				controller: 'MeCtrl'
			}
		}
	})
	.state('tabs.settings', {
		url: '/settings',
		views: {
			'me-tab': {
				templateUrl: 'views/settings/settings.html',
				controller: 'SettingsCtrl'
			}
		}
	})
	.state('tabs.changePassword', {
		url: '/settings/changepassword',
		views: {
			'me-tab': {
				templateUrl: 'views/settings/settings-pages/change-password-page.html',
				controller: 'SettingsCtrl'
			}
		}
	})
	.state('tabs.about', {
		url: '/settings/about',
		views: {
			'me-tab': {
				templateUrl: 'views/settings/settings-pages/about-page.html',
				controller: 'SettingsCtrl'
			}
		}
	})
	.state('tabs.languages', {
		url: '/settings/languages',
		views: {
			'me-tab': {
				templateUrl: 'views/settings/settings-pages/languages-page.html',
				controller: 'SettingsCtrl'
			}
		}
	})
	.state('tabs.helpCenter', {
		url: '/settings/helpcenter',
		views: {
			'me-tab': {
				templateUrl: 'views/settings/settings-pages/help-center-page.html',
				controller: 'SettingsCtrl'
			}
		}
	})
	.state('tabs.reportAProblem', {
		url: '/settings/reportaproblem',
		views: {
			'me-tab': {
				templateUrl: 'views/settings/settings-pages/report-a-problem-page.html',
				controller: 'SettingsCtrl'
			}
		}
	})
	.state('tabs.ads', {
		url: '/settings/ads',
		views: {
			'me-tab': {
				templateUrl: 'views/settings/settings-pages/ads-page.html',
				controller: 'SettingsCtrl'
			}
		}
	})
	.state('tabs.blog', {
		url: '/settings/blog',
		views: {
			'me-tab': {
				templateUrl: 'views/settings/settings-pages/blog-page.html',
				controller: 'SettingsCtrl'
			}
		}
	});
	$urlRouterProvider.otherwise('start');
})

.run(function($ionicPlatform) {
	$ionicPlatform.ready(function() {
		if(window.cordova && window.cordova.plugins.Keyboard) {
			cordova.plugins.Keyboard.hideKeyboardAccessoryBar(false);
		}
		if(window.StatusBar) {
			StatusBar.styleDefault();
		}
	});
});
