angular.module('App', ['ionic', 'ui.router', 'ngCordova', 'ngAnimate', 'ngFileUpload', 'ionic.contrib.ui.cards', 'textAngular'])
.controller('StartCtrl', [
'$rootScope',
'$scope',
'$state',
'$ionicHistory',
'$ionicPopup',
'$ionicLoading',
'auth',
'Misc',
'TimeFormat',
'Language',
'LanguageFormat',
function($rootScope, $scope, $state, $ionicHistory, $ionicPopup, $ionicLoading, auth, Misc, TimeFormat, Language, LanguageFormat){

	// LOADING
	$scope.show = function() {
		$ionicLoading.show({
			template: '<ion-spinner icon="bubbles"></ion-spinner>'
		}).then(function(){
			console.log("The loading indicator is now displayed");
		});
	};
	$scope.hide = function(){
		$ionicLoading.hide().then(function(){
			console.log("The loading indicator is now hidden");
		});
	};

	// LANGUAGE
	$scope.getLanguage = Language.getLanguage;
	$scope.setLanguage = Language.setLanguage;
	$scope.languageName = Language.languageName();

	// LANGUAGE FORMAT
//	$scope.updateLang = LanguageFormat.updateLang;
	
	// MISC
	$scope.languages = Misc.languages();
	$scope.categories = Misc.categories();
	$scope.countries = Misc.countries();
	$scope.levels = Misc.levels();
	$scope.colors = Misc.colors();
	$scope.findLanguage = Misc.findLanguage;
	$scope.findCategory = Misc.findCategory;
	$scope.findColor = Misc.findColor;
	$scope.getColor = Misc.getColor;

	// TIME FORMAT

	/* WHEN DOCUMENT LOADS */
	
	$(document).ready(function() {
		$('.navbar').css("background", "none");
		$('.navbar').css("position", "absolute");
		$('.navbar .navbar-header .navbar-brand .title').css("color", "#fff");
		$('.main-footer').css("margin-top", "0");
		$('[data-toggle="tooltip"]').tooltip(); 
	});

	var checkOnStart = function() {
		if(auth.currentUsername() == undefined) {
			$scope.onStart = true;
		}
	}
	checkOnStart();

	$scope.getLanguage();
	$scope.language = Language.language();
	$(document).ready(function(){
		$('.search-bar-trans').attr("placeholder", $scope.language.searchBar);
		$('.footer-caption-trans').text($scope.language.footerCaption);
		$('.about-trans').text($scope.language.about);
		$('.links-trans').text($scope.language.links);
		$('.contact-us-trans').text($scope.language.contactUs);
		$('.jobs-trans').text($scope.language.jobs);
		$('.ads-trans').text($scope.language.ads);
		$('.blog-trans').text($scope.language.blog);
		$('.report-trans').text($scope.language.report);
		$('.faq-trans').text($scope.language.faq);
		$('.login-trans').text($scope.language.login);
		$('.register-trans').text($scope.language.register);
		$('.settings-trans').text($scope.language.settings);
		$('.help-trans').text($scope.language.help);
		$('.log-out-trans').text($scope.language.logOut);
		$('.points-trans').text($scope.language.points);
		$('.badges-trans').text($scope.language.badges);
		$('.languages-trans').text($scope.language.languages);
		$('.none-trans').text($scope.language.none);
		$('.categories-trans').text($scope.language.categories);
		$('.create-card-trans').text($scope.language.createCard);
		$('.create-deck-trans').text($scope.language.createDeck);
		$('.create-course-trans').text($scope.language.createCourse);
		
		for(var i = 0; i < $scope.languages.length; i++) {
			$scope.languages[i].name = $scope.language[$scope.languages[i].name];
		}
		for(var i = 0; i < $scope.languages.length; i++) {
			$scope.categories[i].name = $scope.language[$scope.categories[i].name];
		}
	});
	
	/* COPY AND PASTE ABOVE INTO EACH CTRL */

	$scope.logOut = function() {
		$scope.show($ionicLoading);
		auth.logOut();
		checkOnStart();
		$state.go('login');
		$scope.hide($ionicLoading);
	};

	// SEARCH BAR
	$('.search-bar.dropdown-input').on('keyup', function (e) {
		if (e.keyCode == 13 && $('.search-bar').val().length != 0) {
			$scope.search($('.search-bar').val());
			return false;    //<---- Add this line
		}
	});
	
	$scope.search = function(name) {
		$state.go('searchQuery', { query: name });
	}
}])
	
.config(function ($stateProvider, $urlRouterProvider) {
	$stateProvider
	.state('start', {
		url: '/start',
		templateUrl: 'views/auth/start.html',
		controller: 'AuthCtrl',
		reload: true,
		onEnter: ['$state', 'auth', function($state, auth){
			if(auth.isLoggedIn()){
				$state.go('home');
			}
		}],
		cache: false
	})
	.state('getStarted', {
		url: '/getStarted',
		templateUrl: 'views/auth/get-started.html',
		controller: 'AuthCtrl',
		onEnter: ['$state', 'auth', function($state, auth){
			if(auth.isLoggedIn()){
				$state.go('home');
			}
		}]
	})
	.state('register', {
		url: '/register',
		templateUrl: 'views/auth/register.html',
		controller: 'AuthCtrl',
		onEnter: ['$state', 'auth', function($state, auth){
			if(auth.isLoggedIn()){
				$state.go('home');
			}
		}]
	})
	.state('login', {
		url: '/login',
		templateUrl: 'views/auth/login.html',
		controller: 'AuthCtrl',
		onEnter: ['$state', 'auth', function($state, auth){
			if(auth.isLoggedIn()){
				$state.go('home');
			}
		}]
	})
	.state('home', {
		url: '/home',
		templateUrl: 'views/home/home.html',
		controller: 'HomeCtrl',
		onEnter: ['$state', 'auth', function($state, auth){
			if(!auth.isLoggedIn()){
				$state.go('login');
			}
		}]
//		resolve: {
//			user: ['$stateParams', 'cards', function($stateParams, cards) {
//				return cards.getAll("All", $stateParams.user, true);
//			}]
//		}
	})
	.state('search', {
		url: '/search',
		templateUrl: 'views/search/search.html',
		controller: 'SearchCtrl',
		onEnter: ['$state', 'auth', function($state, auth){
			if(!auth.isLoggedIn()){
				$state.go('login');
			}
		}]
	})
	.state('searchLanguage', {
		url: '/search/results/:language',
		templateUrl: 'views/search/search-results.html',
		controller: 'SearchCtrl',
		onEnter: ['$state', 'auth', function($state, auth){
			if(!auth.isLoggedIn()){
				$state.go('login');
			}
		}]
	})
	.state('searchCategory', {
		url: '/search/results/:category',
		templateUrl: 'views/search/search-results.html',
		controller: 'SearchCtrl',
		onEnter: ['$state', 'auth', function($state, auth){
			if(!auth.isLoggedIn()){
				$state.go('login');
			}
		}]
	})
	.state('searchQuery', {
		url: '/search/results/:query',
		templateUrl: 'views/search/search-results.html',
		controller: 'SearchCtrl',
		onEnter: ['$state', 'auth', function($state, auth){
			if(!auth.isLoggedIn()){
				$state.go('login');
			}
		}]
	})
	.state('searchTopic', {
		url: '/search/results/:topic',
		templateUrl: 'views/search/search-results.html',
		controller: 'SearchCtrl',
		onEnter: ['$state', 'auth', function($state, auth){
			if(!auth.isLoggedIn()){
				$state.go('login');
			}
		}]
	})
	.state('createCard', {
		url: '/create/card',
		templateUrl: 'views/create/create-form/create-form.html',
		controller: 'CreateCtrl',
		onEnter: ['$state', 'auth', function($state, auth){
			if(!auth.isLoggedIn()){
				$state.go('login');
			}
		}]
	})
	.state('createDeck', {
		url: '/create/deck',
		templateUrl: 'views/create/create-deck-form.html',
		controller: 'CreateCtrl',
		onEnter: ['$state', 'auth', function($state, auth){
			if(!auth.isLoggedIn()){
				$state.go('login');
			}
		}]
	})
	.state('createCourse', {
		url: '/create/course',
		templateUrl: 'views/create/create-course-form.html',
		controller: 'CreateCtrl',
		onEnter: ['$state', 'auth', function($state, auth){
			if(!auth.isLoggedIn()){
				$state.go('login');
			}
		}]
	})
	.state('createMetacard', {
		url: '/create/metacard',
		templateUrl: 'views/create/create-metacard-form.html',
		controller: 'CreateCtrl',
		onEnter: ['$state', 'auth', function($state, auth){
			if(!auth.isLoggedIn()){
				$state.go('login');
			}
		}]
	})
	.state('createTest', {
		url: '/create/test',
		templateUrl: 'views/create/create-test-form.html',
		controller: 'CreateCtrl',
		onEnter: ['$state', 'auth', function($state, auth){
			if(!auth.isLoggedIn()){
				$state.go('login');
			}
		}]
	})
	.state('chat', {
		url: '/chat',
		templateUrl: 'views/chat/chat.html',
		controller: 'ChatCtrl',
		onEnter: ['$state', 'auth', function($state, auth){
			if(!auth.isLoggedIn()){
				$state.go('login');
			}
		}]
	})
	.state('viewChat', {
		url: '/chat/:username',
		templateUrl: 'views/chat/view-chat.html',
		controller: 'ChatCtrl',
		onEnter: ['$state', 'auth', function($state, auth){
			if(!auth.isLoggedIn()){
				$state.go('login');
			}
		}]
	})
	.state('me', {
		url: '/me/:username',
		templateUrl: 'views/profile/profile.html',
		controller: 'MeCtrl',
		onEnter: ['$state', 'auth', function($state, auth){
			if(!auth.isLoggedIn()){
				$state.go('login');
			}
		}]
	})
	.state('progress', {
		url: '/progress/:username',
		templateUrl: 'views/profile/profile-pages/profile-progress.html',
		controller: 'MeCtrl',
		onEnter: ['$state', 'auth', function($state, auth){
			if(!auth.isLoggedIn()){
				$state.go('login');
			}
		}]
	})
	.state('badges', {
		url: '/badges/:username',
		templateUrl: 'views/profile/profile-pages/profile-badges.html',
		controller: 'MeCtrl',
		onEnter: ['$state', 'auth', function($state, auth){
			if(!auth.isLoggedIn()){
				$state.go('login');
			}
		}]
	})
	.state('followers', {
		url: '/followers/:username',
		templateUrl: 'views/profile/profile-pages/profile-followers.html',
		controller: 'MeCtrl',
		onEnter: ['$state', 'auth', function($state, auth){
			if(!auth.isLoggedIn()){
				$state.go('login');
			}
		}]
	})
	.state('following', {
		url: '/following/:username',
		templateUrl: 'views/profile/profile-pages/profile-following.html',
		controller: 'MeCtrl',
		onEnter: ['$state', 'auth', function($state, auth){
			if(!auth.isLoggedIn()){
				$state.go('login');
			}
		}]
	})

	.state('viewCard', {
		url: '/cards/:card/',
		templateUrl: 'views/profile/view-card/view-card.html',
		controller: 'CardCtrl',
		onEnter: ['$state', 'auth', function($state, auth){
			if(!auth.isLoggedIn()){
				$state.go('login');
			}
		}]
	})
	.state('viewDeck', {
		url: '/decks/:deck/',
		templateUrl: 'views/profile/view-deck/view-deck.html',
		controller: 'DeckCourseCtrl',
		onEnter: ['$state', 'auth', function($state, auth){
			if(!auth.isLoggedIn()){
				$state.go('login');
			}
		}]
	})
	.state('viewCourse', {
		url: '/courses/:course/',
		templateUrl: 'views/profile/view-course/view-course.html',
		controller: 'DeckCourseCtrl',
		onEnter: ['$state', 'auth', function($state, auth){
			if(!auth.isLoggedIn()){
				$state.go('login');
			}
		}]
	})
	.state('editCard', {
		url: '/cards/:card/edit',
		templateUrl: 'views/create/create-form/create-form.html',
		controller: 'CardCtrl',
		onEnter: ['$state', 'auth', function($state, auth){
			if(!auth.isLoggedIn()){
				$state.go('login');
			}
		}]
	})
	.state('editDeck', {
		url: '/decks/:deck/edit',
		templateUrl: 'views/create/create-deck-form.html',
		controller: 'DeckCourseCtrl',
		onEnter: ['$state', 'auth', function($state, auth){
			if(!auth.isLoggedIn()){
				$state.go('login');
			}
		}]
	})
	.state('editCourse', {
		url: '/courses/:course/edit',
		templateUrl: 'views/create/create-course-form.html',
		controller: 'DeckCourseCtrl',
		onEnter: ['$state', 'auth', function($state, auth){
			if(!auth.isLoggedIn()){
				$state.go('login');
			}
		}]
	})
	.state('notifications', {
		url: '/notifications',
		templateUrl: 'views/profile/notifications/notifications.html',
		controller: 'MeCtrl',
		onEnter: ['$state', 'auth', function($state, auth){
			if(!auth.isLoggedIn()){
				$state.go('login');
			}
		}]
	})
	.state('settings', {
		url: '/settings',
		templateUrl: 'views/settings/settings.html',
		controller: 'SettingsCtrl',
		onEnter: ['$state', 'auth', function($state, auth){
			if(!auth.isLoggedIn()){
				$state.go('login');
			}
		}]
	})
	.state('changePassword', {
		url: '/settings/changepassword',
		templateUrl: 'views/settings/settings-pages/change-password-page.html',
		controller: 'SettingsCtrl',
		onEnter: ['$state', 'auth', function($state, auth){
			if(!auth.isLoggedIn()){
				$state.go('login');
			}
		}]
	})
	.state('about', {
		url: '/settings/about',
		templateUrl: 'views/settings/settings-pages/about-page.html',
		controller: 'SettingsCtrl'
	})
	.state('jobs', {
		url: '/settings/jobs',
		templateUrl: 'views/settings/settings-pages/jobs-page.html',
		controller: 'SettingsCtrl'
	})
	.state('languages', {
		url: '/settings/languages',
		templateUrl: 'views/settings/settings-pages/languages-page.html',
		controller: 'SettingsCtrl',
		onEnter: ['$state', 'auth', function($state, auth){
			if(!auth.isLoggedIn()){
				$state.go('login');
			}
		}]
	})
	.state('faq', {
		url: '/settings/faq',
		templateUrl: 'views/settings/settings-pages/help-center-page.html',
		controller: 'SettingsCtrl'
	})
	.state('report', {
		url: '/settings/report',
		templateUrl: 'views/settings/settings-pages/report-page.html',
		controller: 'SettingsCtrl',
		onEnter: ['$state', 'auth', function($state, auth){
			if(!auth.isLoggedIn()){
				$state.go('login');
			}
		}]
	})
	.state('ads', {
		url: '/settings/ads',
		templateUrl: 'views/settings/settings-pages/ads-page.html',
		controller: 'SettingsCtrl'
	})
	.state('blog', {
		url: '/settings/blog',
		templateUrl: 'views/settings/settings-pages/blog-page.html',
		controller: 'SettingsCtrl'
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
