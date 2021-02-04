angular.module('App').controller('SettingsCtrl', [
'$rootScope',
'$scope',
'$state',
'$ionicHistory',
'$ionicPopup',
"$ionicLoading",
'auth',
'Misc',
'Language',
'report',
function($rootScope, $scope, $state, $ionicHistory, $ionicPopup, $ionicLoading, auth, Misc, Language, report){
	
	// LOADING
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
	
	// LANGUAGE
	$scope.getLanguage = Language.getLanguage;
	$scope.setLanguage = Language.setLanguage;
	
	// MISC
	$scope.languages = Misc.languages();
	$scope.findLanguage = Misc.findLanguage;
	
	/* WHEN DOCUMENT LOADS */
	
	$(document).ready(function() {
		$('.navbar').css({"background": "#fff", "position": "fixed", "box-shadow": "0 1px 3px rgba(0, 0, 0, 0.3)"});
		$('.navbar-brand button img').css("height", "25px");
		$('body').css("background", "#f6f6f6");
		$('.main-footer').css("top", "auto");
		$('.main-footer').css("margin-top", "150px");
	})
	
	var checkOnStart = function() {
		if(auth.currentUsername() == undefined) {
			$scope.onStart = true;
		}
	}
	checkOnStart();
	
	$(".search-bar").focus(function(){
		$(this).closest(".item-input-wrapper").addClass('active');
		$(".search-dropdown").addClass('active');
	})
	$(".search-bar").focusout(function(){
		$(this).closest(".item-input-wrapper").removeClass('active');
		$(".search-dropdown").removeClass('active');
	});
	
	$scope.getLanguage();
	$scope.language = Language.language();
	$scope.languageName = Language.languageName();
	$(document).ready(function(){
		$('.account-trans').text($scope.language.account);
		$('.change-password-trans').text($scope.language.changePassword);
		$('.settings-trans').text($scope.language.settings);
		$('.languages-trans').text($scope.language.languages);
		$('.report-trans').text($scope.language.report);
		$('.faq-trans').text($scope.language.faq);
		$('.log-out-trans').text($scope.language.logOut);
	});
	
	/* COPY AND PASTE ABOVE INTO EACH CTRL */
	
	$scope.user = {};
	
	$scope.show($ionicLoading);
	$scope.isLoggedIn = auth.isLoggedIn;
	if($rootScope.currentUser) {
		$scope.currentUser = $rootScope.currentUser;
		$scope.hide($ionicLoading);
	} else {
		$scope.currentUser = {};
		auth.whoAmI(auth.currentUsername()).success(function(data){
			angular.copy(data.user, $scope.currentUser);
			$rootScope.currentUser = $scope.currentUser;
			$scope.hide($ionicLoading);
		});
	}
	
	$scope.logOut = function() {
		$scope.show($ionicLoading);
		$state.go('tabs.me');
		auth.logOut();
		$state.go('login');
		$scope.hide($ionicLoading);
	};
	
	$scope.changePassword = function() {
		$scope.show($ionicLoading);
		if(!$scope.user.password || $scope.user.password == '') {
			var alertPopup = $ionicPopup.alert({
				title: 'Uh Oh!',
				template: 'Please fill out the missing field before changing the password.'
			});
			$scope.hide($ionicLoading);
			return ;
		}
		auth.checkPass($scope.user).success(function(data) {
			if(data) {
				auth.changePass($scope.user.password)
				.error(function(error) {
					$scope.hide($ionicLoading);
					var alertPopup = $ionicPopup.alert({
						title: 'Uh Oh!',
						template: 'Something went wrong when updating the password.'
					});
				})
				.success(function(data) {
					$scope.user = {};
					$scope.hide($ionicLoading);
					var alertPopup = $ionicPopup.alert({
						title: 'Success!',
						template: 'You successfully updated the password.'
					});
					$ionicHistory.goBack(-1);
				}).finally(function($ionicLoading) {
					$state.hide($ionicLoading);
				})
			} else {
				var alertPopup = $ionicPopup.alert({
					title: 'Uh Oh!',
					template: 'Please input the correct password.'
				});
				$scope.hide($ionicLoading);
			}
		}).error(function() {
			var alertPopup = $ionicPopup.alert({
				title: 'Uh Oh!',
				template: 'Something went wrong when checking the password.'
			});
			$scope.hide($ionicLoading);
		})
	}
	
	$scope.problem = { description: "", extra: "", email: "", user: auth.currentUsername()};
	$scope.reportAProblem = function() {
		$scope.show($ionicLoading);
		if(!$scope.problem.description || $scope.problem.description == ''
			|| !$scope.problem.email || $scope.problem.email == '') {
			var alertPopup = $ionicPopup.alert({
				title: 'Uh Oh!',
				template: 'Please fill out the description and email before reporting the problem.'
			});
			$scope.hide($ionicLoading);
			return ;
		}

		$scope.problem.description = "[REPORTED PROBLEM] "+ $scope.reportId + " : " + $scope.problem.description;
		
		report.reportAProblem($scope.problem)
		.error(function(error) {
			$scope.hide($ionicLoading);
			var alertPopup = $ionicPopup.alert({
				title: 'Uh Oh!',
				template: 'Something went wrong when reporting the problem.'
			});
		})
		.success(function(data) {
			$scope.problem = { description: "", extra: "", email: "", user: auth.currentUsername()};
			$scope.hide($ionicLoading);
			var alertPopup = $ionicPopup.alert({
				title: 'Success!',
				template: 'You successfully reported the problem. Your email may be contacted for further inquiry.'
			});
			$ionicHistory.goBack(-1);
		}).finally(function($ionicLoading) {
			$state.hide($ionicLoading);
		})
	}
}])