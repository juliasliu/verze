angular.module('App').controller('HomeCtrl', [
'$rootScope',
'$scope',
'$state',
'$filter',
'$ionicPopover',
'$ionicModal',
'$ionicLoading',
'auth',
'users',
'cards',
'user',
'promiseFactory',
function($rootScope, $scope, $state, $filter, $ionicPopover, $ionicModal, $ionicLoading, auth, users, cards, user, promiseFactory){
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
	
	$scope.currentUser = {};
	$scope.show($ionicLoading);
	auth.whoAmI(auth.currentUsername()).success(function(data){
		angular.copy(data.user, $scope.currentUser);
		$rootScope.currentUser = $scope.currentUser;
		$scope.getUser($scope.currentUser);
	});
	
	$scope.onCardClick = function(id) {
		$state.go('tabs.viewCard1', { card: id });
	}
	
	$scope.onDeckClick = function(id) {
		$state.go('tabs.viewDeck1', { deck: id });
	}
	
	$scope.onCourseClick = function(id) {
		$state.go('tabs.viewCourse1', { course: id });
	}
	
	$scope.onHotPickClick = function(hotpick) {
		if(hotpick.content.cards) {
			$state.go('tabs.viewDeck1', { deck: hotpick.content._id });
		} else if(hotpick.content.decks) {
			$state.go('tabs.viewCourse1', { course: hotpick.content._id });
		}
	}
	
	$scope.getUser = function(user) {
		$scope.show($ionicLoading);
		$scope.user = user;

		$scope.initializeHome();
		$scope.loved = $scope.user.loved;
		$scope.badges = $scope.user.badges;
		$scope.emptyBadges = $scope.badges.length == 0;
		$scope.emptyLoved = $scope.user.loved.length == 0;
		$scope.emptyFollowers = $scope.user.followers.length == 0;
		$scope.emptyFollowing = $scope.user.following.length == 0;
		
		cards.getAll("All", $scope.user.username).success(function(data) {
			if($scope.user.username == $scope.currentUser.username) {
				$scope.myCards = cards.myCards;
				$scope.myDecks = cards.myDecks;
				$scope.myCourses = cards.myCourses;
				$scope.cards = $scope.myCards;
				$scope.decks = $scope.myDecks;
				$scope.courses = $scope.myCourses;
			} else {
				$scope.cards = cards.cards;
				$scope.decks = cards.decks;
				$scope.courses = cards.courses;
			}
			$scope.emptyCards = $scope.cards.length == 0;
			$scope.emptyDecks = $scope.decks.length == 0;
			$scope.emptyCourses = $scope.courses.length == 0;
			
			$scope.emptyFeed = $scope.emptyCourses && $scope.emptyDecks;
			$scope.emptyMagic = $scope.emptyLoved || $scope.emptyFollowers || $scope.emptyFollowing;
			
			$scope.template = "views/home/home-feed.html";
		});
	}
	
	$scope.initializeHome = function() {
		Promise.all([$scope.initializeSlideshow(), $scope.initializeClassics(), $scope.initializeFollowed(), $scope.initializeRecUsers()]).then(function(data) {
			$scope.hide($ionicLoading);
		})
	}
	
	$scope.initializeRecUsers = function() {
		$scope.recommendedUsers = [];
		$scope.recommendedUsers = $scope.user.followers;
	}
	
	$scope.initializeFollowed = function() {
		$scope.followedDecks = [];
		$scope.followedCourses = [];
		
		var allDecks = [];
		var allCourses = [];
		
		for(var i = 0; i < $scope.currentUser.following.length; i++) {
			allDecks = allDecks.concat($scope.currentUser.following[i].decks);
			allCourses = allCourses.concat($scope.currentUser.following[i].courses);
		}
		// 1. get latest updatedAt users, 2. get all the decks for those users, 3. sort decks based on last updatedAt, 4. slice 5
		var sliceDeckTop = allDecks.length-5;
		var sliceCourseTop = allCourses.length-5;
		if(allDecks.length < 5) sliceDeckTop = 0;
		if(allCourses.length < 5) sliceCourseTop = 0;
		
		$scope.followedDecks = allDecks.slice(sliceDeckTop, allDecks.length);
		$scope.followedCourses = allCourses.slice(sliceCourseTop, allCourses.length);
		
		//get decks and courses
		for(var i = 0; i < $scope.followedDecks.length; i++) {
			cards.getDeck($scope.followedDecks[i].content, true).success(function(data) {
				var index = $scope.followedDecks.map(function(x) {  return x.content; }).indexOf(data.content._id);
				$scope.followedDecks[index] = data;
			})
		}
		for(var i = 0; i < $scope.followedCourses.length; i++) {
			cards.getCourse($scope.followedCourses[i].content, true).success(function(data) {
				var index = $scope.followedCourses.map(function(x) {  return x.content; }).indexOf(data.course._id);
				$scope.followedCourses[index].content = data.course;
			})
		}
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
		var dfd = promiseFactory.defer();
		cards.getClassicCourses().success(function(){
			$scope.classicCourses = cards.classicCourses;
			return dfd.resolve();
		})
		cards.getClassicDecks().success(function(){
			$scope.classicDecks = cards.classicDecks;
			return dfd.resolve();
		})
		return dfd.promise;
	}
	
	$scope.$watch(function(newValues, oldValues){
		$('.thumbnail-deck').each(function(index) {
			if($scope.decks[index] && $scope.decks[index].content.cards && $scope.decks[index].content.cards.length != 0) var pg = $scope.decks[index].progress.cardIndex/$scope.decks[index].content.cards.length*100;
			if(pg == 0 || pg == undefined) {
				pg = 100;
				$(this).removeClass('complete');
			} else $(this).addClass('complete');
			$(this).append('<style>.thumbnail-deck:after{ width:'+pg+'%; }</style>');
		});
		$('.thumbnail-course').each(function(index) {
			if($scope.courses[index] && $scope.courses[index].content.decks && $scope.courses[index].content.decks.length != 0) var pg = $scope.courses[index].progress.deckIndex/$scope.courses[index].content.decks.length*100;
			if(pg == 0 || pg == undefined) {
				pg = 100;
				$(this).removeClass('complete');
			} else $(this).addClass('complete');
			$(this).append('<style>.thumbnail-course:after{ width:'+pg+'%; }</style>');
		});
	}, true);
	
	$scope.users = [];
	users.getUsers().success(function(data) {
		$scope.users = users.users;
	});
	
	$scope.isFollower = function(item) {
		return $scope.user.followers.indexOf(item._id) != -1;
	}
	$scope.isFollowing = function(item) {
		return $scope.user.following.indexOf(item._id) != -1;
	}
	
	$scope.refreshMe = function() {
		$scope.getUser($scope.user);
		$scope.$broadcast('scroll.refreshComplete');
	};
	
	$scope.switchHomeView = function(tab) {
		$('.home-view.active').removeClass("active");
		if(tab == "Feed") {
			$scope.template = 'views/home/home-feed.html';
			$('.home-feed').addClass("active");
		} else if(tab == "Magic") {
			$scope.template = 'views/home/home-magic.html';
			$('.home-magic').addClass("active");
		}
		$scope.closeHomeViewsPopover();
	};
	
	$ionicPopover.fromTemplateUrl('views/home/home-views.html', {
		scope: $scope
	}).then(function(popover) {
		$scope.popover = popover;
	});

	$scope.openHomeViewsPopover = function($event) {
		$scope.popover.show($event);
	};
	$scope.closeHomeViewsPopover = function() {
		$scope.popover.hide();
	};	
}])