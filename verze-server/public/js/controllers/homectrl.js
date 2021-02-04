angular.module('App').controller('HomeCtrl', [
'$rootScope',
'$scope',
'$state',
'$filter',
"$ionicPopup",
'$ionicPopover',
'$ionicModal',
'$ionicLoading',
'auth',
'users',
'cards',
//'user',
'promiseFactory',
'Misc',
'Language',
'LanguageFormat',
function($rootScope, $scope, $state, $filter, $ionicPopup, $ionicPopover, $ionicModal, $ionicLoading, auth, users, cards, /*user,*/ promiseFactory, Misc, Language, LanguageFormat){
	
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
	
	// LANGUAGE FORMAT
	$scope.updateLang = LanguageFormat.updateLang;
	
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
		$('.navbar-header.home').removeClass('ng-hide');
		$('.navbar-brand .title').addClass('ng-hide');
		$('.navbar-header.start').addClass('ng-hide');
	})
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
	$(document).ready(function(){
		$('.home-trans').text($scope.language.home);
		$('.explore-trans').text($scope.language.explore);
		$('.dashboard-trans').text($scope.language.dashboard);
		$('.following-trans').text($scope.language.following);
		$('.magic-trans').text($scope.language.magic);
		$('.classics-trans').text($scope.language.classics);
	});
	
	var updateLanguage = function(page) {
		if(page == "Dashboard") {
			$('.dashboard-trans').text($scope.language.dashboard);
			$('.dashboard-caption-trans').text($scope.language.dashboardCaption);
			$('.today-trans').text($scope.language.today);
			$('.this-week-trans').text($scope.language.thisWeek);
			$('.this-month-trans').text($scope.language.thisMonth);
			$('.welcome-back-trans').text($scope.language.welcomeBack);
			$('.get-started-trans').text($scope.language.getStarted);
			$('.courses-trans').text($scope.language.courses);
			$('.decks-trans').text($scope.language.decks);
		} else if(page == "Feed") {
			$('.feed-trans').text($scope.language.feed);
			$('.feed-caption-trans').text($scope.language.feedCaption);
			$('.courses-trans').text($scope.language.courses);
			$('.decks-trans').text($scope.language.decks);
			$('.cards-trans').text($scope.language.cards);
			$('.follow-users-trans').text($scope.language.followUsers);
		} else if(page == "Magic") {
			$('.magic-trans').text($scope.language.magic);
			$('.magic-caption-trans').text($scope.language.magicCaption);
			$('.courses-trans').text($scope.language.courses);
			$('.decks-trans').text($scope.language.decks);
			$('.cards-trans').text($scope.language.cards);
			$('.follow-users-trans').text($scope.language.followUsers);
		} else if(page == "Classics") {
			$('.classics-trans').text($scope.language.classics);
			$('.classics-caption-trans').text($scope.language.classicsCaption);
			$('.courses-trans').text($scope.language.courses);
			$('.decks-trans').text($scope.language.decks);
		}
	}
	
	/* COPY AND PASTE ABOVE INTO EACH CTRL */
	
	$scope.template = "views/home/home-dashboard.html";
	
	$scope.onCardClick = function(id) {
		$state.go('viewCard', { card: id });
	}
	
	$scope.onDeckClick = function(id) {
		$state.go('viewDeck', { deck: id });
	}
	
	$scope.onCourseClick = function(id) {
		$state.go('viewCourse', { course: id });
	}
	
	$('.search-bar').keydown(function(event) {
        if (event.keyCode == 13) {
            this.form.submit();
            return false;
         }
    });
	
	$scope.onHotPickClick = function(hotpick) {
		if(hotpick.content.cards) {
			$state.go('viewDeck', { deck: hotpick.content._id });
		} else if(hotpick.content.decks) {
			$state.go('viewCourse', { course: hotpick.content._id });
		}
	}
	
	$scope.getUser = function(user) {
		$scope.show($ionicLoading);
		
		cards.getAll([false, true, true], $scope.currentUser.username, true).success(function(data) {
			$scope.myCards = cards.myCards;
			$scope.myDecks = cards.myDecks;
			$scope.myCourses = cards.myCourses;
			$scope.cards = $scope.myCards;
			$scope.decks = $scope.myDecks;
			$scope.courses = $scope.myCourses;

			$scope.setUserVars();
		});
	}
	
	$scope.setUserVars = function() {
		$scope.loved = $scope.currentUser.loved;
		$scope.badges = $scope.currentUser.badges;
		$scope.emptyBadges = $scope.badges.length == 0;
		$scope.emptyLoved = $scope.currentUser.loved.length == 0;
		$scope.emptyFollowers = $scope.currentUser.followers.length == 0;
		$scope.emptyFollowing = $scope.currentUser.following.length == 0;
		
		$scope.emptyCards = $scope.cards.length == 0;
		$scope.emptyDecks = $scope.decks.length == 0;
		$scope.emptyCourses = $scope.courses.length == 0;
		
		$scope.emptyDashboard = $scope.emptyCourses && $scope.emptyDecks;
		if($scope.emptyDashboard) $scope.initializeClassics();
		$scope.emptyMagic = $scope.emptyFeed && $scope.emptyLoved && $scope.emptyFollowing;

		updateLanguage("Dashboard");
		$scope.hide($ionicLoading);
	}
	
	$scope.show($ionicLoading);
	$scope.currentUser = {};
	if($rootScope.currentUser) {
		$scope.currentUser = $rootScope.currentUser;
		$scope.getUser($scope.currentUser);
	} else if(auth.getUser()){
		angular.copy(auth.getUser(), $scope.currentUser);
		$rootScope.currentUser = $scope.currentUser;
		$scope.getUser($scope.currentUser);
	} else {
		auth.whoAmI(auth.currentUsername()).success(function(data){
			angular.copy(data.user, $scope.currentUser);
			$rootScope.currentUser = $scope.currentUser;
			$scope.getUser($scope.currentUser);
		});
	}
	
	$scope.followUser = function(user) {
		users.followUser(user).success(function(){
			var alertPopup = $ionicPopup.alert({
				title: 'Okay!',
				template: 'You have successfully followed this user.'
			});
		})
	}
	$scope.unfollowUser = function(user) {
		users.unfollowUser(user).success(function(){
			var alertPopup = $ionicPopup.alert({
				title: 'Okay!',
				template: 'You have unfollowed this user.'
			});
		})
	}
	
	/* INITIALIZE HOME
	 * 
	 * Key functions:
	 * 	
	 * 		initializeSlideshow							gets Hot Picks from server and starts slideshow
	 * 		initializeClassics							gets Classic courses and decks
	 * 		initializeFollowing							gets courses, decks, and cards from users who currentUser follows
	 * 			getFollowing
	 * 		initializeMagic								gets recommended users, courses, decks, and cards for currentUser
	 * 			getRecUsers
	 * 			getRecCourses
	 * 			getRecDecks
	 * 			getRecCards
	 */
	
	$scope.initializeMagic = function() {
		$scope.show($ionicLoading);
		$scope.initializeClassics().success(function() {
			$scope.getRecUsers();
			$scope.getRecCourses();
			$scope.getRecDecks();
			$scope.getRecCards();
			
			$scope.loadedMagic = true;
			$scope.hide($ionicLoading);
		})
	}
	
	$scope.getRecUsers = function() {
		$scope.recUsers = [];
		$scope.recUsers = $scope.currentUser.followers;
	}

	$scope.getRecCourses = function() {
		$scope.recCourses = [];
		$scope.recCourses = $scope.classicCourses;
	}
	
	$scope.getRecDecks = function() {
		$scope.recDecks = [];
		$scope.recDecks = $scope.classicDecks;
	}
	
	$scope.getRecCards = function() {
		$scope.recCards = [];
		$scope.recCards = $scope.followedCards;
	}
	
	$scope.initializeFeed = function() {
		$scope.show($ionicLoading);
		
		$scope.followedDecks = [];
		$scope.followedCourses = [];
		$scope.followedCards = [];
		
		var allDecks = [];
		var allCourses = [];
		var allCards = [];
		var numDecks = 0;
		var numCourses = 0;
		
		for(var i = 0; i < $scope.currentUser.following.length; i++) {
			numDecks += $scope.currentUser.following[i].decks.length;
			for(var j = 0; j < $scope.currentUser.following[i].decks.length; j++) {
				cards.getDeck($scope.currentUser.following[i].decks[j].content, true).success(function(data) {
					var index = $scope.currentUser.following.map(function(x) {  return x.username; }).indexOf(data.content.author.username);
					if(index != -1) allDecks.push(data);
					else allDecks.push({});
					if(allDecks.length == numDecks) getFollowing("deck", allDecks);
				})
			}
			
			numCourses += $scope.currentUser.following[i].courses.length;
			for(var j = 0; j < $scope.currentUser.following[i].courses.length; j++) {
				cards.getCourse($scope.currentUser.following[i].courses[j].content, true).success(function(data) {
					var index = $scope.currentUser.following.map(function(x) {  return x.username; }).indexOf(data.author.username);
					data.course.author = data.author;
					if(index != -1) allCourses.push({ content: data.course });
					else allCourses.push({});
					if(allCourses.length == numCourses) getFollowing("course", allCourses);
				})
			}
		}
		if($scope.currentUser.following.length == 0) $scope.hide($ionicLoading);

		//get decks and courses
//		for(var i = 0; i < $scope.followedDecks.length; i++) {
//			cards.getDeck($scope.followedDecks[i].content, true).success(function(data) {
//				var index = $scope.followedDecks.map(function(x) {  return x.content; }).indexOf(data.content._id);
//				$scope.followedDecks[index] = data;
//			})
//		}
//		for(var i = 0; i < $scope.followedCourses.length; i++) {
//			cards.getCourse($scope.followedCourses[i].content, true).success(function(data) {
//				var index = $scope.followedCourses.map(function(x) {  return x.content; }).indexOf(data.course._id);
//				$scope.followedCourses[index].content = data.course;
//			})
//		}
		
		// sort decks and courses based on last updatedAt, slice most recent 5
//		var sliceDeckTop = allDecks.length-5;
//		var sliceCourseTop = allCourses.length-5;
//		if(allDecks.length < 5) sliceDeckTop = 0;
//		if(allCourses.length < 5) sliceCourseTop = 0;
	}
	
	var getFollowing = function(type, array) {
		function lastUpdatedAt(a,b){
			// Turn your strings into dates, and then subtract them
			// to get a value that is either negative, positive, or zero.
			return new Date(b.updatedAt) - new Date(a.updatedAt);
		}

		for(var i = 0; i < array.length; i++) {
			if(!array[i].updatedAt) {
				array.splice(i, 1);
				i = 0;
			}
		}
		array.sort(lastUpdatedAt);
		if(type == "deck") $scope.followedDecks = array.slice(0, 5);
		if(type == "course") $scope.followedCourses = array.slice(0, 5);

		$scope.emptyFeed = ($scope.followedDecks.length < 5) || ($scope.followedCourses.length < 5) || ($scope.followedCards.length < 5);

		$scope.loadedFeed = true;
		$scope.hide($ionicLoading);
	}
	
	$scope.initializeSlideshow = function() {
		var dfd = promiseFactory.defer();
		cards.getHotPicks().success(function(){
			$scope.hotPicks = cards.hotPicks;
			if($scope.hotPicks.length > 1) {
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
			return dfd.resolve();
		})
		return dfd.promise;
	}
	$scope.initializeClassics = function() {
		$scope.show($ionicLoading);
		
		$scope.classicCourses = [];
		$scope.classicDecks = [];
		
		var dfd = promiseFactory.defer();
		cards.getClassicCourses().success(function(){
			$scope.classicCourses = cards.classicCourses;
			$scope.recCourses = $scope.classicCourses;

			$scope.loadedClassics = true;
			$scope.hide($ionicLoading);
			return dfd.resolve();
		})
		cards.getClassicDecks().success(function(){
			$scope.classicDecks = cards.classicDecks;
			$scope.recDecks = $scope.classicDecks;

			$scope.loadedClassics = true;
			$scope.hide($ionicLoading);
			return dfd.resolve();
		})
		return dfd.promise;
	}
	
	/* END INITIALIZE HOME */
	
	$scope.$watch(function(newValues, oldValues){
//		$('.thumbnail-deck').each(function(index) {
//			if($scope.decks[index] && $scope.decks[index].content.cards && $scope.decks[index].content.cards.length != 0) var pg = $scope.decks[index].progress.cardIndex/$scope.decks[index].content.cards.length*100;
//			if(pg == 0 || pg == undefined) {
//				pg = 100;
//				$(this).removeClass('complete');
//			} else $(this).addClass('complete');
//			$(this).append('<style>.thumbnail-deck:after{ width:'+pg+'%; }</style>');
//		});
//		$('.thumbnail-course').each(function(index) {
//			if($scope.courses[index] && $scope.courses[index].content.decks && $scope.courses[index].content.decks.length != 0) var pg = $scope.courses[index].progress.deckIndex/$scope.courses[index].content.decks.length*100;
//			if(pg == 0 || pg == undefined) {
//				pg = 100;
//				$(this).removeClass('complete');
//			} else $(this).addClass('complete');
//			$(this).append('<style>.thumbnail-course:after{ width:'+pg+'%; }</style>');
//		});
	}, true);
	
	$scope.users = [];
	users.getUsers().success(function(data) {
		$scope.users = users.users;
	});
	
	$scope.isFollower = function(item) {
		return $scope.currentUser.followers.indexOf(item._id) != -1;
	}
	$scope.isFollowing = function(item) {
		return $scope.currentUser.following.indexOf(item._id) != -1;
	}
	
	$scope.refreshMe = function() {
		$scope.getUser($scope.currentUser);
		$scope.$broadcast('scroll.refreshComplete');
	};
	
	$scope.switchHomeView = function(page) {
		if(page == "Dashboard") {
			$scope.template = 'views/home/home-dashboard.html';
		} else if(page == "Feed") {
			$scope.template = 'views/home/home-feed.html';
			if(!$scope.loadedFeed) $scope.initializeFeed();
		} else if(page == "Magic") {
			$scope.template = 'views/home/home-magic.html';
			if(!$scope.loadedMagic) $scope.initializeMagic();
		} else if(page == "Classics") {
			$scope.template = 'views/home/home-classics.html';
			if(!$scope.loadedClassics) $scope.initializeClassics();
		}
		updateLanguage(page);
	};
}])