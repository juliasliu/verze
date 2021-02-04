angular.module('App').controller('ChatCtrl', [
'$rootScope',
'$scope',
'$state',
'$ionicPopover',
'$ionicLoading',
'auth',
'cards',
'users',
function($rootScope, $scope, $state, $ionicPopover, $ionicLoading, auth, cards, users){
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
	
	var rightNow = new Date();
	$scope.messages = [
		{ text: "If you are seeing this message, something went wrong with retrieving this conversation", date: rightNow },
		{ text: "To go back, press the back button at the top. To refresh this conversation, pull down this page", date: rightNow }
	]
	//Hello, hola, bonjour, 你好, こんにちは, 안녕하세요, hallo! Welcome to Verze, {{ currentUser.firstname }} {{ currentUser.lastname }}.
}])