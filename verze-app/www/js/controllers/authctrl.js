angular.module('App').controller('AuthCtrl', [
'$rootScope',
'$scope',
'$state',
'$ionicHistory',
'$ionicPopup',
'$ionicPopover',
'$ionicLoading',
'auth',
'users',
'Misc',
'BadFilter',
function($rootScope, $scope, $state, $ionicHistory, $ionicPopup, $ionicPopover, $ionicLoading, auth, users, Misc, BadFilter){
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
	$scope.user = {};
	$scope.user.languages = [];
	
	$scope.languages = Misc.languages();
	$scope.findLanguage = function(name) {
		return Misc.findLanguage(name);
	}
	$scope.levels = Misc.levels();
	$scope.countries = Misc.countries();
	$scope.template = "views/auth/register-start.html";
	$scope.goTo = function(type) {
		$('.start-btn.active').removeClass("active");
		if(type == 'register') {
			$scope.template = "views/auth/register-start.html";
			$('.register-btn').addClass("active");
		} else if(type == 'login') {
			$scope.template = "views/auth/login-start.html";
			$('.login-btn').addClass("active");
		}
	}

	$scope.goBack = function() {
		$ionicHistory.goBack(-1);
	}

	// IONIC SLIDES
	
	$scope.options = {
			loop: false,
			effect: 'fade',
			speed: 500,
	}
	
	$scope.$on("$ionicSlides.sliderInitialized", function(event, data){
		// data.slider is the instance of Swiper
		$scope.slider = data.slider;
	});

	$scope.$on("$ionicSlides.slideChangeEnd", function(event, data){
		// note: the indexes are 0-based
		$scope.activeIndex = data.slider.activeIndex;
		$scope.previousIndex = data.slider.previousIndex;
	});
	
	$scope.template = "views/auth/register-1.html";
	$scope.switchRegisterTab = function(tab) {
		if(tab == "1") {
			$scope.template = 'views/auth/register-1.html';
		} else if(tab == "2") {
			if(!$scope.user.username || $scope.user.username == ''
				|| !$scope.user.password || $scope.user.password == ''
				|| !$scope.user.email || $scope.user.email == '') {
				var alertPopup = $ionicPopup.alert({
					title: 'Uh Oh!',
					template: 'Please complete all fields before continuing.'
				});
			} else $scope.template = 'views/auth/register-2.html';
		}
	};
	
	// OPEN EULA
	
	$ionicPopover.fromTemplateUrl('views/auth/eula.html', {
		scope: $scope
	}).then(function(popover) {
		$scope.eulaPopover = popover;
	});

	$scope.openEULA = function($event) {
		$scope.eulaPopover.show($event);
	};
	$scope.closeEULA = function() {
		$scope.eulaPopover.hide();
	};
	
	//REGISTER
	$scope.vars = { eula: false };
	
	$scope.register = function(){
		$scope.show($ionicLoading);
		$scope.user.languages = [];
		if($scope.user.username == "" || !$scope.user.username ||
			$scope.user.password == "" || !$scope.user.password ||
			$scope.user.firstname == "" || !$scope.user.firstname ||
			$scope.user.lastname == "" || !$scope.user.lastname ||
			$scope.user.email == "" || !$scope.user.email ||
			$scope.user.country == null || !$scope.user.country ||
//			$scope.user.birthday == null || !$scope.user.birthday ||
			!$scope.vars.eula) {
			var alertPopup = $ionicPopup.alert({
				title: 'Uh Oh!',
				template: 'Please complete all fields before registering.'
			});
			$scope.hide($ionicLoading);
			return;
		} else if(BadFilter.containBadWords($scope.user.username) ||
				BadFilter.containBadWords($scope.user.password) ||
				BadFilter.containBadWords($scope.user.firstname) ||
				BadFilter.containBadWords($scope.user.lastname) ||
				BadFilter.containBadWords($scope.user.email)) {
			var alertPopup = $ionicPopup.alert({
				title: 'Uh Oh!',
				template: 'Please do not register objectionable content.'
			});
			$scope.hide($ionicLoading);
			return;
//		} else if(2017 - ($scope.user.birthday.getYear()-100+2000) <= 4) {
//			var alertPopup = $ionicPopup.alert({
//				title: 'Uh Oh!',
//				template: 'You must be at least 4 years old to register.'
//			});
//			$scope.hide($ionicLoading);
//			return;
		}
		auth.register($scope.user).error(function(error){
			$scope.error = error;
			console.log($scope.error);
			var alertPopup = $ionicPopup.alert({
				title: 'Uh Oh!',
				template: 'Something went wrong when registering.'
			});
		}).then(function(){
			$scope.user = {};
			$scope.currentUser = {};
			users.followUser("verze");
			auth.whoAmI(auth.currentUsername()).success(function(data){
				angular.copy(data.user, $scope.currentUser);
				$rootScope.currentUser = $scope.currentUser;
//				$state.go('tabs.home');
				$scope.whichCourse();
			});
		}).finally(function($ionicLoading) {
			$scope.hide($ionicLoading);
		});
	};
	
	$scope.whichCourse = function() {
		/*if($scope.languageSelected=="English") $state.go('tabs.viewCourse1', { course: "59b9d62db7bcaed219bec6cd" });
		else*/ if($scope.languageSelected=="Chinese") $state.go('tabs.viewCourse1', { course: "59b9d62db7bcaed219bec6cd" });
		else if($scope.languageSelected=="Spanish") $state.go('tabs.viewCourse1', { course: "5a8bbcbdd6ed739b42f160fb" });
	}

	// LOGIN
	
	$scope.logIn = function(){
		$scope.show($ionicLoading);
		if(!$scope.user.username || $scope.user.username == ""
			|| !$scope.user.password || $scope.user.password == "") {
			var alertPopup = $ionicPopup.alert({
				title: 'Uh Oh!',
				template: 'Please complete all fields before continuing.'
			});
			$scope.hide($ionicLoading);
			return;
		}
		auth.logIn($scope.user).error(function(error){
			$scope.error = error;
			var alertPopup = $ionicPopup.alert({
				title: 'Uh Oh!',
				template: 'Something went wrong when logging in.'
			});
		}).then(function(){
			$scope.user.username = "";
			$scope.user.password = "";
			$scope.currentUser = {};
			auth.whoAmI(auth.currentUsername()).success(function(data){
				angular.copy(data.user, $scope.currentUser);
				$rootScope.currentUser = $scope.currentUser;
				$state.go('tabs.home');
			});
		}).finally(function($ionicLoading) {
			$scope.hide($ionicLoading);
		});
	};
	
	// START TUTORIAL
	
	$scope.languageSelected = "";
	$scope.levelSelected = "";
	
	$scope.getSlideActive = function(type, what) {
		if(type=='language') {
			$scope.languageSelected = what;
			$('#slide-1').css("left","-100%");
			$('#slide-2').css("left","0");
//		} else if(type='level') {
//			$scope.levelSelected = what;
//			$('#slide-2').css("left","-100%");
//			$('#slide-3').css("left","0");
		}
	}
}])