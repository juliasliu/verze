var app = angular.module('dreamemo', ['ui.router']);

app.controller('MainCtrl', [
'$scope',
'$state',
function($scope, $state){
	$scope.go = function(option, view) {
		$('.header-tab').removeClass("active");
		if(option == "home") {
			$state.go("home");
			$('#home-tab').addClass("active");
		} else if(option == "about") {
			$state.go("about");
			$('#about-tab').addClass("active");
		} else if(option == "faq") {
			$state.go("faq");
			$('#faq-tab').addClass("active");
		} else if(option == "contact") {
			$state.go("contact");
			$('#contact-tab').addClass("active");
		}
	}
	
	$scope.scrnIndex = 1;
	$scope.prev = function() {
		$scope.scrnIndex--;
		if($scope.scrnIndex == 0) $scope.scrnIndex = 4;
		$scope.showScrn($scope.scrnIndex);
	}
	$scope.next = function() {
		$scope.scrnIndex++;
		if($scope.scrnIndex == 5) $scope.scrnIndex = 1;
		$scope.showScrn($scope.scrnIndex);
	}
	$scope.showScrn = function(index) {
		$('.screenshot').removeClass("active");
		if(index == 1) $('#scrn1').addClass("active");
		else if(index == 2) $('#scrn2').addClass("active");
		else if(index == 3) $('#scrn3').addClass("active");
		else if(index == 4) $('#scrn4').addClass("active");
	}
	
	$scope.questions = [
		{question: "How do I create an account?", answer: "Before you create an account, make sure to have the app downloaded. Currently, it is only available on the Apple iPhone App Store. Once you have it downloaded, you can register with your full name, username, email, and password."},
		{question: "How do I record an entry in my dream journal?", answer: "There are three buttons on the bottom. Click on the rightmost one that says 'Memo' underneath. Make sure to go to the tab that says 'Today' at the top. Then you can record whatever you want."},
		{question: "How do I see my entries?", answer: "When you are in the 'Memo' modal, click on the tab at the top that says 'Past.' It will show all the entries that you have made in your dream journal."},
		{question: "How do I edit my entries the next day?", answer: "Unfortunately, you can't. You have until 11:59 PM UTC of the same day to edit an entry before it is permanent. Be careful of the timezone!"},
		{question: "How do I change my username or email or delete my account?", answer: "Sorry, that feature is unavailable yet."},
		{question: "How do I change the background and the sounds?", answer: "In the home page, there are three buttons on the bottom. Click on the middle one that says 'Change' underneath to switch the scenes to the one you prefer."}
	]
}]);

app.config([
'$stateProvider',
'$urlRouterProvider',
function($stateProvider, $urlRouterProvider) {

	$stateProvider
	.state('home', {
		url: '/home',
		templateUrl: '/home.html',
		controller: 'MainCtrl'
	})
	.state('about', {
		url: '/about',
		templateUrl: '/about.html',
		controller: 'MainCtrl'
	})
	.state('faq', {
		url: '/faq',
		templateUrl: '/faq.html',
		controller: 'MainCtrl'
	})
	.state('contact', {
		url: '/contact',
		templateUrl: '/contact.html',
		controller: 'MainCtrl'
	});

	$urlRouterProvider.otherwise('home');
}]);