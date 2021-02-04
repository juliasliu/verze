angular.module('App').controller('MeCtrl', [
'$rootScope',
'$scope',
'$state',
'$timeout',
"$ionicPopup",
'$ionicPopover',
'$ionicModal',
'$ionicActionSheet',
'$ionicLoading',
'ImageService',
'Misc',
'DateFormat',
'auth',
'users',
'cards',
'BadFilter',
function($rootScope, $scope, $state, $timeout, $ionicPopup, $ionicPopover, $ionicModal, $ionicActionSheet, $ionicLoading, ImageService, Misc, DateFormat, auth, users, cards, BadFilter) {
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
	$scope.formatDate = function(date) {
		return DateFormat.formatDate(date);
	};
	
	$scope.$watch(function(newValues, oldValues){
		$('.profile-tabs-container .deck').each(function(index) {
			if($scope.decks[index] && $scope.decks[index].content.cards.length != 0) var pg = $scope.decks[index].progress.cardIndex/$scope.decks[index].content.cards.length*100;
			if(pg == 0 || pg == undefined) {
				pg = 100;
				$(this).removeClass('complete');
			} else $(this).addClass('complete');
			$(this).append('<style>.deck:before{ width:'+pg+'%; }</style>');
		});
		$('.course').each(function(index) {
			if($scope.courses[index] && $scope.courses[index].content.decks.length != 0) var pg = $scope.courses[index].progress.deckIndex/$scope.courses[index].content.decks.length*100;
			if(pg == 0 || pg == undefined) {
				pg = 100;
				$(this).removeClass('complete');
			} else $(this).addClass('complete');
			$(this).append('<style>.course:before{ width:'+pg+'%; }</style>');
		});
	}, true);
	
	$scope.languages = Misc.languages();
	$scope.findLanguage = function(name) {
		return Misc.findLanguage(name);
	}
	$scope.countries = Misc.countries();
	
	//PROFILE

	$scope.profileMode = true;
	
	$scope.currentUser = $rootScope.currentUser;
	$scope.sameUser = true;
	
	$scope.getUser = function(user, getAll, refreshAll) {
		if(user.username) {
			$scope.user = user;
			$scope.sameUser = $scope.currentUser.username == $scope.user.username;
			$scope.isFollowing = $scope.currentUser.following.map(function(x) {return x._id; }).indexOf($scope.user._id) != -1;
			cards.getLoved($scope.user.username).success(function(data) {
				$scope.loved = cards.loved;
			})
			$scope.badges = $scope.user.badges;
			$scope.emptyBadges = $scope.badges.length == 0;
			$scope.emptyLoved = $scope.user.loved.length == 0;
			$scope.emptyFollowers = $scope.user.followers.length == 0;
			$scope.emptyFollowing = $scope.user.following.length == 0;
		} else {
			users.getUser(user).success(function(data) {
				$scope.user = data.user;
				$scope.isFollowing = $scope.currentUser.following.map(function(x) {return x._id; }).indexOf($scope.user._id) == -1;
				cards.getLoved($scope.user.username).success(function(data) {
					$scope.loved = cards.loved;
				})
				$scope.badges = $scope.user.badges;
				$scope.emptyBadges = $scope.badges.length == 0;
				$scope.emptyLoved = $scope.user.loved.length == 0;
				$scope.emptyFollowers = $scope.user.followers.length == 0;
				$scope.emptyFollowing = $scope.user.following.length == 0;
			})
		}
		
		if(refreshAll) {
			$scope.show($ionicLoading);
			auth.whoAmI(auth.currentUsername()).success(function(data){
				angular.copy(data.user, $scope.currentUser);
				$rootScope.currentUser = $scope.currentUser;
			}).finally(function($ionicLoading) {
				$scope.hide($ionicLoading);
			});
		}
		
		if(getAll) {
			$scope.show($ionicLoading);
			if(!$scope.user) {
				$scope.user = {};
				$scope.user.username = user;
			}
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
			}).finally(function($ionicLoading) {
				$scope.hide($ionicLoading);
			});
		} else {
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
		}
	};

	if($state.params.username) {
		$scope.getUser($state.params.username, true);
	} else {
		$scope.getUser($scope.currentUser, false);
	}
	
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
	
	$scope.followUser = function(user) {
		users.followUser(user).success(function(){
			console.log("followed user successfully");
		})
	}
	$scope.unfollowUser = function(user) {
		users.unfollowUser(user).success(function(){
			console.log("unfollowed user successfully");
		})
	}
	
	$scope.refreshMe = function() {
		$scope.getUser($scope.user, true, true);
		$scope.$broadcast('scroll.refreshComplete');
	};
	
	// BLOCK USER
	
	$ionicPopover.fromTemplateUrl('views/profile/block/profile-block-user-popover.html', {
		scope: $scope
	}).then(function(popover) {
		$scope.userOptionsPopover = popover;
	});

	$scope.openUserOptionsPopover = function($event) {
		$scope.userOptionsPopover.show($event);
	};
	$scope.closeUserOptionsPopover = function() {
		$scope.userOptionsPopover.hide();
	};
	
	$ionicModal.fromTemplateUrl('views/profile/block/profile-block-user.html', {
		scope: $scope,
		animation: 'slide-in-up'
	}).then(function(modal) {
		$scope.blockModal = modal;
	});

	$scope.openBlockUser = function() {
		$scope.blockModal.show();
	};
	$scope.closeBlockUser = function() {
		$scope.blockModal.hide();
	};
	
	$scope.blockUser = function() {
		var alertPopup = $ionicPopup.alert({
			title: 'Hold on!',
			template: 'Apologies, we are still working on this service.'
		});
	}
	
	$scope.template = "views/profile/profile-tabs/profile-tabs-cards.html";
	$scope.switchProfTab = function(tab) {
		$('.profile-tab.active').removeClass("active");
		if(tab == "Cards") {
			$scope.template = 'views/profile/profile-tabs/profile-tabs-cards.html';
			$('.cards-tab').addClass("active");
		} else if(tab == "Decks") {
			$scope.template = 'views/profile/profile-tabs/profile-tabs-decks.html';
			$('.decks-tab').addClass("active");
		} else if(tab == "Courses") {
			$scope.template = 'views/profile/profile-tabs/profile-tabs-courses.html';
			$('.courses-tab').addClass("active");
		} else if(tab == "Loved") {
			$scope.template = 'views/profile/profile-tabs/profile-tabs-loved.html';
			$('.loved-tab').addClass("active");
		}
	};

	$ionicPopover.fromTemplateUrl('views/profile/profile-popovers/profile-edit-avatar.html', {
		scope: $scope
	}).then(function(popover) {
		$scope.avatarPopover = popover;
	});

	$scope.openAvatarPopover = function($event) {
		$scope.avatarPopover.show($event);
	};
	$scope.closeAvatarPopover = function() {
		$scope.avatarPopover.hide();
	};
	
	$scope.editAvatar = function(action) {
		if(action == 'view') {
			
		} else if(action == 'upload') {
			ImageService.handleMediaDialog(1).then(function(res) {
				users.changeAvatar(res);
				$scope.closeAvatarPopover();
				$scope.refreshMe();
			});
		} else if(action == 'take') {
			ImageService.handleMediaDialog(0).then(function(res) {
				users.changeAvatar(res);
				$scope.closeAvatarPopover();
			});
		} else if(action == 'delete') {
			users.resetAvatar()
			.success(function() {
				var alertPopup = $ionicPopup.alert({
					title: 'Success',
					template: 'Your avatar was successfully deleted.'
				});
			}).error(function() {
				var alertPopup = $ionicPopup.alert({
					title: 'Uh Oh!',
					template: 'Something went wrong when deleting your avatar.'
				});
			});
			$scope.closeAvatarPopover();
		}
		
	}
	
	$ionicPopover.fromTemplateUrl('views/profile/profile-popovers/profile-language.html', {
		scope: $scope
	}).then(function(popover) {
		$scope.langPopover = popover;
	});

	$scope.openLangPopover = function($event, lang) {
		$scope.langPopover.show($event);
		$scope.lang = lang;
	};
	$scope.closeLangPopover = function() {
		$scope.langPopover.hide();
	};
	
	$ionicModal.fromTemplateUrl('views/profile/profile-pages/profile-settings.html', {
		scope: $scope,
		animation: 'slide-in-up'
	}).then(function(modal) {
		$scope.profileModal = modal;
	});

	$scope.openProfileModal = function() {
		$scope.profileModal.show();
	};
	$scope.closeProfileModal = function() {
		var hideSheet = $ionicActionSheet.show({
			buttons: [
			          { text: 'Save Updates' }
			          ],
			          titleText: 'Close',
			          destructiveText: 'Discard Edits',
			          cancelText: 'Cancel',
			          cancel: function() {
			        	  // add cancel code..
			          },
			          buttonClicked: function(index) {
			        	  if(index == 0) {
			        		  $scope.show($ionicLoading);
			        		  if(BadFilter.containBadWords($scope.currentUser.username) ||
			        				  BadFilter.containBadWords($scope.currentUser.password) ||
			        				  BadFilter.containBadWords($scope.currentUser.firstname) ||
			        				  BadFilter.containBadWords($scope.currentUser.lastname) ||
			        				  BadFilter.containBadWords($scope.currentUser.email)) {
			        			  var alertPopup = $ionicPopup.alert({
			        				  title: 'Uh Oh!',
			        				  template: 'Please do not register objectionable content.'
			        			  });
			        			  $scope.hide($ionicLoading);
			        			  return;
			        		  }

		        			  users.updateProfile($scope.currentUser).success(function(){
			        			  $scope.hide($ionicLoading);
			        			  var alertPopup = $ionicPopup.alert({
			        					title: 'Profile Updated',
			        					template: 'You have successfully updated your profile.'
			        				});
					        	  $scope.profileModal.hide();
			        		  }).error(function() {
			        			  $scope.hide($ionicLoading);
			        			  var alertPopup = $ionicPopup.alert({
			        					title: 'Uh Oh!',
			        					template: 'Something went wrong when updating your profile.'
			        				});
			        		  })
				        	  hideSheet();
			        	  }
			          },
			          destructiveButtonClicked: function() {
			        	  auth.whoAmI(auth.currentUsername()).success(function(data){
			        			angular.copy(data.user, $scope.currentUser);
			        		});
			        	  hideSheet();
			        	  $scope.profileModal.hide();
			          }
		});
	};
	
	//PROFILE END
	
	$scope.onCardClick = function(id) {
		$state.go('tabs.viewCard3', { card: id });
	}
	
	$scope.onDeckClick = function(id) {
		$state.go('tabs.viewDeck3', { deck: id });
	}
	
	$scope.onCourseClick = function(id) {
		$state.go('tabs.viewCourse3', { course: id });
	}
}])