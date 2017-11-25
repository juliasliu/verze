var app = angular.module('verze', ['ui.router']);

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
		} else if(option == "blog") {
			$state.go("blog");
			$('#blog-tab').addClass("active");
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
		if($scope.scrnIndex == 0) $scope.scrnIndex = 5;
		$scope.showScrn($scope.scrnIndex);
	}
	$scope.next = function() {
		$scope.scrnIndex++;
		if($scope.scrnIndex == 6) $scope.scrnIndex = 1;
		$scope.showScrn($scope.scrnIndex);
	}
	$scope.showScrn = function(index) {
		$('.screenshot').removeClass("active");
		if(index == 1) $('#scrn1').addClass("active");
		else if(index == 2) $('#scrn2').addClass("active");
		else if(index == 3) $('#scrn3').addClass("active");
		else if(index == 4) $('#scrn4').addClass("active");
		else if(index == 5) $('#scrn5').addClass("active");
	}
	
	$scope.hellos = [
		{ text: "Hello!" },
		{ text: "¡Hola!" },
		{ text: "你好!" },
		{ text: "Bonjour!" },
		{ text: "こんにちは！" },
		{ text: "Hallo!" },
		{ text: "안녕!" },
		{ text: "Ciao!" },
		{ text: "नमस्कार!" },
		{ text: "Здравствуйте!" }
	]
	
	$scope.initializeSlideshow = function() {
		if($scope.hellos.length > 1) {
			$(".slideshow > div:gt(0)").hide();

			setInterval(function() {
				$('.slideshow > div:first')
				.fadeOut(1000)
				.next()
				.fadeIn(1000)
				.end()
				.appendTo('.slideshow');
			}, 10000);
		}
	}
	$scope.initializeSlideshow();
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
	.state('blog', {
		url: '/blog',
		templateUrl: '/blog.html',
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