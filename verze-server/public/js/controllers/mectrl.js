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
'Language',
'LanguageFormat',
'DateFormat',
'auth',
'users',
'cards',
'BadFilter',
function($rootScope, $scope, $state, $timeout, $ionicPopup, $ionicPopover, $ionicModal, $ionicActionSheet, $ionicLoading, ImageService, Misc, Language, LanguageFormat, DateFormat, auth, users, cards, BadFilter) {
	
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
	$scope.countries = Misc.countries();
	
	// DATE FORMAT
	$scope.formatDate = DateFormat.formatDate;
	
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
	
	$scope.getLanguage();
	$scope.language = Language.language();
	$(document).ready(function(){
		$('.name-trans').text($scope.language.name);
		$('.experience-trans').text($scope.language.experience);
		$('.points-trans').text($scope.language.points);
		$('.badges-trans').text($scope.language.badges);
		$('.languages-trans').text($scope.language.languages);
		$('.location-trans').text($scope.language.location);
		$('.member-since-trans').text($scope.language.memberSince);
		$('.recommended-topics-trans').text($scope.language.recommendedTopics);
		$('.follow-users-trans').text($scope.language.followUsers);
		$('.followers-trans').text($scope.language.followers);
		$('.following-trans').text($scope.language.following);
		$('.myself-trans').text($scope.language.myself);
		$('.follow-trans').text($scope.language.follow);
		$('.followed-trans').text($scope.language.followed);
		$('.unfollow-trans').text($scope.language.unfollow);
		$('.cards-trans').text($scope.language.cards);
		$('.decks-trans').text($scope.language.decks);
		$('.courses-trans').text($scope.language.courses);
		$('.loved-trans').text($scope.language.loved);
	});
	
	/* COPY AND PASTE ABOVE INTO EACH CTRL */
	
	$scope.$watch(function(newValues, oldValues){
//		$('.profile-tabs-container .deck').each(function(index) {
//			if($scope.decks[index] && $scope.decks[index].content.cards.length != 0) var pg = $scope.decks[index].progress.cardIndex/$scope.decks[index].content.cards.length*100;
//			if(pg == 0 || pg == undefined) {
//				pg = 100;
//				$(this).removeClass('complete');
//			} else $(this).addClass('complete');
//			$(this).append('<style>.deck:before{ width:'+pg+'%; }</style>');
//		});
//		$('.course').each(function(index) {
//			if($scope.courses[index] && $scope.courses[index].content.decks.length != 0) var pg = $scope.courses[index].progress.deckIndex/$scope.courses[index].content.decks.length*100;
//			if(pg == 0 || pg == undefined) {
//				pg = 100;
//				$(this).removeClass('complete');
//			} else $(this).addClass('complete');
//			$(this).append('<style>.course:before{ width:'+pg+'%; }</style>');
//		});
	}, true);
	
	//PROFILE

	$scope.profileMode = true;
	
	$scope.sameUser = true;
	
	$scope.getUser = function(user, getAll, refreshAll) {
		$scope.show($ionicLoading);
		
		// if from own profile
		if(user.username) {
			$scope.user = user;
			$scope.sameUser = $scope.currentUser.username == $scope.user.username;
			setSideProfile();
			setFollowers();
			$scope.hide($ionicLoading);
		} else {
			users.getUser(user).success(function(data) {
				$scope.user = data.user;
				$scope.sameUser = $scope.currentUser.username == $scope.user.username;
				setSideProfile();
				setFollowers();
			})
		}
		
		if(getAll) {
			$scope.show($ionicLoading);
			if(!$scope.user) {
				$scope.user = {};
				$scope.user.username = user;
			}
			cards.getAll([true, false, false], $scope.user.username, true).success(function(data) {
				setMainProfile("cards");
				$scope.gotCards = true;
				$scope.hide($ionicLoading);
			})
		} else {
			setMainProfile("cards");
			$scope.hide($ionicLoading);
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
	};
	
	$scope.show($ionicLoading);
	$scope.currentUser = {};
	if($rootScope.currentUser) {
		$scope.currentUser = $rootScope.currentUser;
		if($state.params.username) $scope.getUser($state.params.username, true, false);
		else $scope.getUser($scope.currentUser.username, true);
//	} else if(auth.getUser()){
//		angular.copy(auth.getUser(), $scope.currentUser);
//		$rootScope.currentUser = $scope.currentUser;
//		if($state.params.username) $scope.getUser($state.params.username, true, false);
//		else $scope.getUser($scope.currentUser.username, true);
	} else {
		auth.whoAmI(auth.currentUsername()).success(function(data){
			angular.copy(data.user, $scope.currentUser);
			$rootScope.currentUser = $scope.currentUser;
			if($state.params.username) $scope.getUser($state.params.username, true, false);
			else $scope.getUser($scope.currentUser.username, true);
		});
	}

	// FOLLOWER / FOLLOWING
	
	var setFollowers = function() {
		if($state.current.name == 'followers' && $state.params.username) {
			users.getFollowers($state.params.username).success(function(data) {
				$scope.user.followers = users.followers;
			})
		}
		if($state.current.name == 'following' && $state.params.username) {
			users.getFollowing($state.params.username).success(function(data) {
				$scope.user.following = users.following;
			})
		}
	}
	
	// SET PROFILE SECTIONS IN GETUSER()
	
	var setSideProfile = function() {
		$scope.isFollowing = $scope.isFollowing($scope.user);
		$scope.showUnfollow = false;
		cards.getLoved($scope.user.username).success(function(data) {
			$scope.loved = cards.loved;
		})
		$scope.badges = $scope.user.badges;
		$scope.emptyBadges = $scope.badges.length == 0;
		$scope.emptyLoved = $scope.user.loved.length == 0;
		$scope.emptyFollowers = $scope.user.followers.length == 0;
		$scope.emptyFollowing = $scope.user.following.length == 0;
		
		$scope.recUsers = [];
		$scope.recUsers = $scope.currentUser.followers;
		
		if(!$scope.user.website.includes("http://") && !$scope.user.website.includes("https://")) {
			$scope.user.website = "https://" + $scope.user.website;
		}
		var level = Misc.getLevel($scope.user.exp);
		$scope.user.level = level.level;
		$scope.expProgress = level.leftover;
		$('#exp-progress-bar').css({'width': $scope.expProgress+'%'});
	}
	
	var setMainProfile = function(type) {
		if($scope.user.username == $scope.currentUser.username) {
			$scope.myCards = $scope.user.cards;
			$scope.myDecks = $scope.user.decks;
			$scope.myCourses = $scope.user.courses;
			if(type == "cards") {
				$scope.myCards = cards.myCards;
			} else if(type == "decks") {
				$scope.myDecks = cards.myDecks;
			} else if(type == "courses") {
				$scope.myCourses = cards.myCourses;
			}
			$scope.cards = $scope.myCards;
			$scope.decks = $scope.myDecks;
			$scope.courses = $scope.myCourses;
		} else {
			if(type == "cards") {
				$scope.cards = cards.cards;
			} else if(type == "decks") {
				$scope.decks = cards.decks;
			} else if(type == "courses") {
				$scope.courses = cards.courses;
			}
		}
		$scope.emptyCards = $scope.cards.length == 0;
		$scope.emptyDecks = $scope.decks.length == 0;
		$scope.emptyCourses = $scope.courses.length == 0;
	}
	
	$scope.users = [];
	users.getUsers().success(function(data) {
		$scope.users = users.users;
	});
	
	$scope.isFollower = function(item) {
		if($scope.currentUser.followers.indexOf(item._id) == -1) {
			return $scope.currentUser.followers.map(function(x) {return x._id; }).indexOf(item._id) != -1;
		} else return $scope.currentUser.followers.indexOf(item._id) != -1;
	}
	$scope.isFollowing = function(item) {
		if($scope.currentUser.following.indexOf(item._id) == -1) {
			return $scope.currentUser.following.map(function(x) {return x._id; }).indexOf(item._id) != -1;
		} else return $scope.currentUser.following.indexOf(item._id) != -1;
	}
	
	$scope.followUser = function(user) {
		users.followUser(user).success(function(){
			$scope.refreshMe();
		})
	}
	$scope.unfollowUser = function(user) {
		users.unfollowUser(user).success(function(){
			$scope.refreshMe();
		})
	}
	
	$scope.hoverFollow = function() {
		$scope.showUnfollow = true;
	}
	$scope.unhoverFollow = function() {
		$scope.showUnfollow = false;
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
		$scope.cardsView.checked = false;
		if(tab == "Cards") {
			$scope.template = 'views/profile/profile-tabs/profile-tabs-cards.html';
			$('.cards-tab').addClass("active");
			$scope.emptyCards = $scope.cards.length == 0;
		} else if(tab == "Decks") {
			if(!$scope.gotDecks) {
				$scope.show($ionicLoading);
				cards.getAll([false, true, false], $scope.user.username, true).success(function(data) {
					$scope.gotDecks = true;
					setMainProfile("decks");
					$scope.emptyDecks = $scope.decks.length == 0;
					$scope.hide($ionicLoading);
				})
			}
			$scope.template = 'views/profile/profile-tabs/profile-tabs-decks.html';
			$('.decks-tab').addClass("active");
		} else if(tab == "Courses") {
			if(!$scope.gotCourses) {
				$scope.show($ionicLoading);
				cards.getAll([false, false, true], $scope.user.username, true).success(function(data) {
					$scope.gotCourses = true;
					setMainProfile("courses");
					$scope.emptyCourses = $scope.courses.length == 0;
					$scope.hide($ionicLoading);
				})
			}
			$scope.template = 'views/profile/profile-tabs/profile-tabs-courses.html';
			$('.courses-tab').addClass("active");
		} else if(tab == "Loved") {
			$scope.template = 'views/profile/profile-tabs/profile-tabs-loved.html';
			$('.loved-tab').addClass("active");
			$scope.emptyLoved = $scope.loved.length == 0;
		}
	};
	
	// DECK OPTIONS
	
	$ionicPopover.fromTemplateUrl('views/profile/profile-popovers/profile-view-tabs-options.html', {
		scope: $scope
	}).then(function(popover) {
		$scope.viewTabOptionsPopover = popover;
	});

	$scope.firstEnter = true;
	$scope.cardsView = { checked: true };
	$scope.openViewTabOptionsPopover = function($event) {
		$scope.viewTabOptionsPopover.show($event);
		if($scope.firstEnter) {
			$('.side-switch').change(function() {
				$scope.checkCardsViewSwitch();
			})
			$scope.firstEnter = false;
		}
	};
	
	$scope.closeViewTabOptionsPopover = function() {
		$scope.viewTabOptionsPopover.hide();
	};
	
	$scope.checkCardsViewSwitch = function() {
		if($scope.cardsView.checked) {
			$('.card-list').removeClass('active');
			$('.phrase-list').addClass('active');
		} else {
			$('.card-list').addClass('active');
			$('.phrase-list').removeClass('active');
		}
	}

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
		$state.go('viewCard', { card: id });
	}
	
	$scope.onDeckClick = function(id) {
		$state.go('viewDeck', { deck: id });
	}
	
	$scope.onCourseClick = function(id) {
		$state.go('viewCourse', { course: id });
	}
}])