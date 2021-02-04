angular.module('App').controller('SettingsCtrl', [
'$rootScope',
'$scope',
'$state',
'$ionicHistory',
'$ionicPopup',
"$ionicLoading",
'auth',
'Misc',
'report',
function($rootScope, $scope, $state, $ionicHistory, $ionicPopup, $ionicLoading, auth, Misc, report){
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
	
	$scope.languages = Misc.languages();
	$scope.findLanguage = function(name) {
		return Misc.findLanguage(name);
	}
	
//	$scope.isLoggedIn = auth.isLoggedIn;
//	$scope.currentUser = auth.currentUser;
//	
//	$scope.user = {};
//	angular.copy($scope.currentUser, $scope.user);
	$scope.user = {};
	$scope.currentUser = {};
	$scope.show($ionicLoading);
	auth.whoAmI(auth.currentUsername()).success(function(data){
		angular.copy(data.user, $scope.currentUser);
		$rootScope.currentUser = $scope.currentUser;
	}).finally(function($ionicLoading) {
		$scope.hide($ionicLoading);
	});
	
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