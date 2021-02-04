angular.module('App').controller('ChatCtrl', [
'$rootScope',
'$scope',
'$state',
'$ionicPopover',
'$ionicLoading',
'auth',
'cards',
'users',
'Language',
'LanguageFormat',
function($rootScope, $scope, $state, $ionicPopover, $ionicLoading, auth, cards, users, Language, LanguageFormat){
	
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
	
	// LANGUAGE FORMAT
	$scope.updateLang = LanguageFormat.updateLang;
	
	/* WHEN DOCUMENT LOADS */
	
	$(document).ready(function() {
		$('.navbar').css({"background": "#fff", "position": "fixed", "box-shadow": "0 1px 3px rgba(0, 0, 0, 0.3)"});
		$('.navbar-brand button img').css("height", "25px");
		$('body').css("background", "#f6f6f6");
		$('.main-footer').css("top", "auto");
		$('.main-footer').css("margin-top", "150px");
	})
	$(".search-bar").focus(function(){
		$(this).closest(".item-input-wrapper").addClass('active');
		$(".search-dropdown").addClass('active');
	})
	$(".search-bar").focusout(function(){
		$(this).closest(".item-input-wrapper").removeClass('active');
		$(".search-dropdown").removeClass('active');
	});
	
	/* COPY AND PASTE ABOVE INTO EACH CTRL */
	
	$scope.getUser = function() {
		$scope.show($ionicLoading);

		cards.getAll([true, true, true], $scope.currentUser.username, true).success(function(data) {
			$scope.myCards = cards.myCards;
			$scope.myDecks = cards.myDecks;
			$scope.myCourses = cards.myCourses;
			$scope.cards = $scope.myCards;
			$scope.decks = $scope.myDecks;
			$scope.courses = $scope.myCourses;
			$scope.hide($ionicLoading);
		})
	};
	
	$scope.show($ionicLoading);
	$scope.currentUser = {};
	if($rootScope.currentUser) {
		$scope.currentUser = $rootScope.currentUser;
		$scope.getUser();
	} else if(auth.getUser()){
		angular.copy(auth.getUser(), $scope.currentUser);
		$rootScope.currentUser = $scope.currentUser;
		$scope.getUser();
	} else {
		auth.whoAmI(auth.currentUsername()).success(function(data){
			angular.copy(data.user, $scope.currentUser);
			$rootScope.currentUser = $scope.currentUser;
			$scope.getUser();
		});
	}
	
	$scope.user = {};
	$scope.rightNow = new Date();
	$scope.messages = [
		{ text: "If you are seeing this message, something went wrong with retrieving this conversation", format: "text", time: $scope.rightNow, user: $scope.user },
		{ text: "To go back, press the back button at the top. To refresh this conversation, press reload on the page.", format: "text", time: $scope.rightNow, user: $scope.user }
	]
	//Hello, hola, bonjour, 你好, こんにちは, 안녕하세요, hallo! Welcome to Verze, {{ currentUser.firstname }} {{ currentUser.lastname }}.
	
	$scope.data = { message: "" };
	
	$scope.sendMessage = function(){
		$scope.messages.push({ text: $scope.data.message, format: "text", time: $scope.rightNow, user: $scope.currentUser });
		$scope.data.message = "";
	}
	
	$scope.showMessageOptions = function(index) {
		$($('.message-options')[index]).addClass('active');
	}
	$scope.hideMessageOptions = function(index) {
		$($('.message-options')[index]).removeClass('active');
	}
}])