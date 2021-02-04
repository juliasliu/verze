angular.module('App').controller('DeckCourseCtrl', [
'$rootScope',
'$ionicHistory',
'$scope',
'$state',
'$timeout',
"$ionicPopup",
'$ionicPopover',
'$ionicModal',
'$ionicActionSheet',
'$ionicLoading',
'$ionicHistory',
'ImageService',
'Misc',
'DateFormat',
'auth',
'users',
'cards',
'report',
'BadFilter',
function($rootScope, $ionicHistory, $scope, $state, $timeout, $ionicPopup, $ionicPopover, $ionicModal, $ionicActionSheet, $ionicLoading, $ionicHistory, ImageService, Misc, DateFormat, auth, users, cards, report, BadFilter) {

	$scope.currentUser = $rootScope.currentUser;
	
	$scope.languages = Misc.languages();
	$scope.categories = Misc.categories();
	$scope.levels = Misc.levels();

	$scope.findLanguage = function(name) {
		return Misc.findLanguage(name);
	}
	$scope.formatDate = function(date) {
		return DateFormat.formatDate(date);
	};
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
	$ionicPopover.fromTemplateUrl('views/profile/unavailable.html', {
		scope: $scope
	}).then(function(popover) {
		$scope.unavailPopover = popover;
	});

	$scope.showUnavailablePopover = function($event) {
		$scope.unavailPopover.show($event);
	};
	$scope.closeUnavailablePopover = function() {
		$scope.unavailPopover.hide();
	};
	
	var checkJSON = function checkJSON(str) {
	    try {
	        JSON.parse(str);
	    } catch (e) {
	        return false;
	    }
	    return true;
	}
	
	$scope.getUser = function(user) {
		$scope.user = user;
		
		if($ionicHistory.currentStateName().substr(0, 13) == 'tabs.editDeck' || $ionicHistory.currentStateName().substr(0, 13) == 'tabs.editCourse') {
			cards.getAll("All", $scope.user.username).success(function(data) {
				if($scope.user.username == $scope.currentUser.username) {
					$scope.myCards = cards.myCards;
					$scope.myDecks = cards.myDecks;
					$scope.myCourses = cards.myCourses;
				} else {
					$scope.cards = cards.cards;
					$scope.decks = cards.decks;
					$scope.courses = cards.courses;
				}
				$scope.hide($ionicLoading);
			});
		} else {
			$scope.myCards = [];
			$scope.myDecks = [];
			$scope.myCourses = [];
			angular.copy($scope.currentUser.cards, $scope.myCards);
			angular.copy($scope.currentUser.decks, $scope.myDecks);
			angular.copy($scope.currentUser.courses, $scope.myCourses);
		}

		if($state.params.deck) {
			$scope.refreshDeck($state.params.deck);
		}
		if($state.params.course) {
			$scope.refreshCourse($state.params.course);
		}
	}
	
	$scope.show($ionicLoading);
	auth.whoAmI(auth.currentUsername()).success(function(data){
		angular.copy(data.user, $scope.currentUser);
		$rootScope.currentUser = $scope.currentUser;
		$scope.getUser($scope.currentUser);
	});
	
	$scope.onCardClick = function(id) {
		if($ionicHistory.currentHistoryId() == 'ion1') {
			$state.go('tabs.viewCard1', { card: id });
		} else if($ionicHistory.currentHistoryId() == 'ion2') {
			$state.go('tabs.viewCard2', { card: id });
		} else if($ionicHistory.currentHistoryId() == 'ion4') {
			$state.go('tabs.viewCard3', { card: id });
		}
	}
	
	$scope.onDeckClick = function(id) {
		if($ionicHistory.currentHistoryId() == 'ion1') {
			$state.go('tabs.viewDeck1', { deck: id });
		} else if($ionicHistory.currentHistoryId() == 'ion2') {
			$state.go('tabs.viewDeck2', { deck: id });
		} else if($ionicHistory.currentHistoryId() == 'ion4') {
			$state.go('tabs.viewDeck3', { deck: id });
		}
	}
	
	$scope.onEditDeckClick = function(id) {
		if($ionicHistory.currentHistoryId() == 'ion1') {
			$state.go('tabs.editDeck1', { deck: id });
		} else if($ionicHistory.currentHistoryId() == 'ion2') {
			$state.go('tabs.editDeck2', { deck: id });
		} else if($ionicHistory.currentHistoryId() == 'ion4') {
			$state.go('tabs.editDeck3', { deck: id });
		}
	}
	
	$scope.onEditCourseClick = function(id) {
		if($ionicHistory.currentHistoryId() == 'ion1') {
			$state.go('tabs.editCourse1', { course: id });
		} else if($ionicHistory.currentHistoryId() == 'ion2') {
			$state.go('tabs.editCourse2', { course: id });
		} else if($ionicHistory.currentHistoryId() == 'ion4') {
			$state.go('tabs.editCourse3', { course: id });
		}
	}
	
	$scope.$watch(function(newValues, oldValues) {
		$('#review-bar').css({'width': $scope.reviewProgress+'%'});
		$('#mini-bar').css({'width': $scope.miniProgress+'%'});
		
		if($scope.reviewProgress && $scope.reviewProgress == 0) {
			$('.deck-navbar').removeClass('complete');
			$('.deck-navbar').append('<style>.deck-navbar:before{ width: 100%; }</style>');
		} else {
			$('.deck-navbar').addClass('complete');
			$('.deck-navbar').append('<style>.deck-navbar:before{ width: '+$scope.reviewProgress +'%; }</style>');
		}
		if($scope.reviewProgress && $scope.reviewProgress == 0) {
			$('.course-navbar').removeClass('complete');
			$('.course-navbar').append('<style>.course-navbar:before{ width: 100%; }</style>');
		} else {
			$('.course-navbar').addClass('complete');
			$('.course-navbar').append('<style>.course-navbar:before{ width: '+$scope.reviewProgress +'%; }</style>');
		}
		$('.deck-list .deck').each(function(index) {
			if($scope.course && $scope.course.content && $scope.course.content.decks && $scope.course.content.decks[index] && $scope.course.content.decks[index].progress && $scope.course.content.decks[index].progress.cardIndex)
				var pg = $scope.course.content.decks[index].progress.cardIndex/$scope.course.content.decks[index].content.cards.length*100;
			if(pg == 0 || pg == undefined) {
				pg = 100;
				$(this).removeClass('complete');
			} else $(this).addClass('complete');
			$(this).append('<style>.course-view .deck:before{ width:'+pg+'%; }</style>');
		});
	})
	
	/* CARD */
	
	/* KEY SECTIONS:
	 * 		card love
	 * 		card comments
	 * 		card notes
	 * 		card play audio
	 * 		card parts
	 */
	
	// CARD LOVE
	
	$scope.loveCard = function() {
		if($scope.currentUser.loved.indexOf($scope.card._id) != -1) {
			cards.unloveCard($scope.card).success(function() {
				auth.whoAmI(auth.currentUsername()).success(function(data){
					angular.copy(data.user, $scope.currentUser);
					$scope.checkLoveCard();
				});
			});
		} else {
			cards.loveCard($scope.card).success(function() {
				auth.whoAmI(auth.currentUsername()).success(function(data){
					angular.copy(data.user, $scope.currentUser);
					$scope.checkLoveCard();
				});
			});
		}
	};
	$scope.checkLoveCard = function() {
		if($scope.currentUser.loved.indexOf($scope.card._id) == -1) {
			$('.card-love-btn').css({"color": "rgba(255, 255, 255, 0.75)"});
		} else {
			$('.card-love-btn').css({"color": "rgba(0, 204, 150, 0.75)"});
		}
	}
	
	// CARD COMMENTS
	
	$ionicModal.fromTemplateUrl('views/profile/view-card/view-card-comments.html', {
		scope: $scope,
		animation: 'slide-in-up'
	}).then(function(modal) {
		$scope.cardCommentsModal = modal;
	});
	$scope.showCardComments = function() {
		$scope.cardComments = true;
		$scope.cardCommentsModal.show();
	};
	$scope.closeCardComments = function() {
		$scope.cardCommentsModal.hide();
		$scope.cardComments = false;
	};
	
	$scope.comment = {};
	$scope.addCardComment = function(card) {
		$scope.show($ionicLoading);
		if(!$scope.comment.content || $scope.comment.content === '') {
			$scope.hide($ionicLoading);
			return;
		}
		cards.addCardComment({
			content: $scope.comment.content,
			card: card,
			avatar: $scope.currentUser.avatar
		}).success(function() {
			$scope.comment.content = "";
			$scope.refreshCard();
		}).error(function() {
			var alertPopup = $ionicPopup.alert({
				title: 'Uh Oh!',
				template: 'Something went wrong when publishing your comment.'
			});
		}).finally(function($ionicLoading) {
			$scope.hide($ionicLoading);
		});
	};
	$scope.loveComment = function(comment) {
		cards.loveComment(comment);
	};
	
	// CARD NOTES
	
	$ionicModal.fromTemplateUrl('views/profile/view-card/view-card-notes.html', {
		scope: $scope,
		animation: 'slide-in-up'
	}).then(function(modal) {
		$scope.cardNotesModal = modal;
	});

	$scope.showCardNotes = function() {
		$scope.cardNotesModal.show();
	};
	$scope.closeCardNotes = function() {
		$scope.cardNotesModal.hide();
	};
	
	// CARD PLAY AUDIO
	$scope.currentRecording = new Audio();
	$scope.playRecording = function(index) {
		if($scope.card.recordingFiles[index]) {
			$scope.currentRecording.src = $scope.card.recordingFiles[index];
			$scope.currentRecording.play();
		}
	}
	
	// CARD PARTS
	
	$scope.showCardParts = { showPronun: true, showExample: true, showMagic: true };

	$scope.toggleShowCardParts = function() {
		var box = $(".item.activated input:checkbox");
		if($(".item.activated input").val() == "pronunciation") {
			if (box.is(":checked")) {
				box.prop("checked", false);
				$scope.showCardParts.showPronun = false;
			} else {
				box.prop("checked", true);
				$scope.showCardParts.showPronun = true;
			}
		} else if($(".item.activated input").val() == "example") {
			if (box.is(":checked")) {
				box.prop("checked", false);
				$scope.showCardParts.showExample = false;
			} else {
				box.prop("checked", true);
				$scope.showCardParts.showExample = true;
			}
		} else if($(".item.activated input").val() == "magic") {
			if (box.is(":checked")) {
				box.prop("checked", false);
				$scope.showCardParts.showMagic = false;
			} else {
				box.prop("checked", true);
				$scope.showCardParts.showMagic = true;
			}
		}
	}
	
	/* DECK */
	
	/* KEY VARIABLES:
	 * 		reviewMode
	 * 		searchMode
	 */
	
	$scope.reviewMode = false;
	$scope.searchMode = false;
	
	/* KEY FUNCTIONS:
	 *		refreshDeck
	 *		initializeDeck
	 * 		startDeck
	 * 		learnDeck
	 * 		reviewDeck
	 * 		testDeck
	 * 		resetDeck
	 */
	
	/* PROGRESS KEY:
	 * 
	 * 		DECKS
	 * 		If cardIndex < cards.length, still in learn mode
	 * 		If cardIndex == cards.length, in review mode
	 * 		If cardIndex == cards.length+1, finished review, deckIndex++
	 * 
	 * 		COURSES
	 * 		If deckIndex < decks.length, still in learn mode
	 * 		If deckIndex == decks.length, in final mode
	 * 		If deckIndex == decks.length+1, in final review mode
	 */
	
	$scope.refreshDeck = function(id, inReview) {
		$scope.deck = {};
		$scope.deck.content = {};
		$scope.show($ionicLoading);
		cards.getDeck(id, true, true, true).success(function(data) {
			$scope.deck = cards.currentDeck;
			$scope.emptyCardsInDeck = $scope.deck.content.cards.length == 0;
			if($scope.deck.content.course) {
				cards.getCourse($scope.deck.content.course, true, true, true).success(function(data) {
					$scope.deck.content.course = cards.currentCourse;
				});

				cards.getCourseProgress($scope.deck.content.course).success(function(data) {
					$scope.deckIndex = data.deckIndex;
				})
			}
			cards.getDeckProgress($scope.deck.content._id).success(function(data) {
				if(data && data.cardIndex) $scope.reviewProgress = Math.floor(data.cardIndex/$scope.deck.content.cards.length*100);
				else $scope.reviewProgress, $scope.cardIndex = 0;
				if(inReview) {
					$scope.startDeck();
					$scope.learnDeck();
				}
			});
			$scope.refreshCourses();
		})
		.finally(function() {
			$scope.hide($ionicLoading);
			$scope.$broadcast('scroll.refreshComplete');
		});
	};
	
	$scope.initializeDeck = function() {
		$scope.emptyCardsInDeck = $scope.deck.content.cards.length == 0;
		$scope.firstEnter = true;
		$scope.side = { checked: false };
		$scope.thisDeck = [];
	}
	
	$scope.startDeck = function(mode) {
		$scope.checkIfSaved("deck").success(function(){
			$scope.reviewProgress = Math.floor($scope.cardIndex/$scope.deck.content.cards.length*100);
			if($scope.deck.content.cards.length < 4) {
				var alertPopup = $ionicPopup.alert({
					title: 'Oops!',
					template: 'You can not review a deck with less than 4 cards.'
				});
			} else if($scope.deck.content.cards.length != 0) {
				$scope.reviewDeckModal.show();
				
				$scope.initializeDeck();
				angular.copy($scope.deck.content.cards, $scope.thisDeck);
				if($scope.deckIndex != undefined && $scope.course != undefined && $scope.course.content != undefined) {
					$scope.hasMetacards = true;
					angular.copy($scope.course.content.metacards, $scope.metacardsArray);
					$scope.updateMetaCard();
				} else $scope.hasMetacards = false;
				
				cards.getDeckProgress($scope.deck.content._id).success(function(data) {
					$scope.progress = data;
					$scope.currentIndex = $scope.progress.cardIndex;

					if(mode == "learn") {
						$scope.learnDeck();
					} else if(mode == "review") {
						$scope.reviewDeck();
					} else if(mode == "test") {
						$scope.testDeck();
					}
				})
			}
		})
	}
	
	$scope.learnDeck = function() {
		// check if in learn mini or review or test mode
		$scope.setLearnMode();
		if($scope.currentIndex < $scope.deck.content.cards.length) {
			$scope.showCardParts.showMagic = true;
			$scope.reviewProgress = Math.floor($scope.currentIndex/$scope.deck.content.cards.length*100);
			$scope.setProgress($scope.reviewProgress);
			$scope.updateDeck($scope.currentIndex);
		} else if($scope.currentIndex == $scope.deck.content.cards.length) {
			$scope.testDeck();
		}
	}
	
	$scope.reviewDeck = function() {
		if(!$scope.learnMode[2]) $scope.setReviewMode(true);
		$scope.showCardParts.showMagic = false;
		$scope.reviewProgress = 100;
		$scope.miniProgress = 0;
		$scope.setMiniProgress($scope.miniProgress);
		$scope.updateDeck($scope.deck.content.cards.length);
		$scope.initializeMiniReview();
	}
	
	$scope.testDeck = function() {
		if(!$scope.learnMode[2]) $scope.setTestMode(true);
		$scope.reviewDeck();
	}
	
	$scope.resetDeck = function() {
		var confirmPopup = $ionicPopup.confirm({
			title: 'Reset Deck',
			template: 'Are you sure you want to start over?'
		});

		confirmPopup.then(function(res) {
			if(res) {
				$scope.currentIndex = 0;
				$scope.goBackToDeckCourse();
			}
		});
	};
	
	/* KEY SECTIONS:
	 * 		deck options
	 * 		deck view
	 * 		deck flag
	 * 		deck save
	 * 		deck edit
	 * 		deck delete
	 */

	// DECK OPTIONS
	
	$ionicPopover.fromTemplateUrl('views/profile/view-deck/view-deck-options.html', {
		scope: $scope
	}).then(function(popover) {
		$scope.deckOptionsPopover = popover;
	});

	$scope.firstDeckEnter = true;
	$scope.deckView = { checked: false };
	$scope.openDeckOptionsPopover = function($event) {
		$scope.deckOptionsPopover.show($event);
		if($scope.firstDeckEnter) {
			$('.side-switch').change(function() {
				$scope.checkDeckViewSwitch();
			})
			$scope.firstDeckEnter = false;
		}
	};
	
	$scope.closeDeckOptionsPopover = function() {
		$scope.deckOptionsPopover.hide();
	};
	
	// DECK VIEW
	
	$scope.checkDeckViewSwitch = function() {
		if(!$scope.deckView.checked) {
			$('.card-list').removeClass('active');
			$('.phrase-list').addClass('active');
		} else {
			$('.card-list').addClass('active');
			$('.phrase-list').removeClass('active');
		}
	}
	
	// DECK FLAG / COURSE FLAG
	
	$ionicModal.fromTemplateUrl('views/profile/flag/flag-content.html', {
		scope: $scope,
		animation: 'slide-in-up'
	}).then(function(modal) {
		$scope.flagModal = modal;
	});

	$scope.showFlag = function() {
		$scope.flagModal.show();
	};
	$scope.closeFlag = function() {
		$scope.flagModal.hide();
	};

	$scope.problem = { description: "", extra: "", email: "", user: auth.currentUsername()};
	$scope.flagContent = function() {
		$scope.show($ionicLoading);
		if($scope.card != null) {
			$scope.flagId = $scope.card._id;
		} else if($scope.deck.content != null) {
			$scope.flagId = $scope.deck.content._id;
		} else if($scope.course.content != null) {
			$scope.flagId = $scope.course.content._id;
		}
		
		if(!$scope.problem.description || $scope.problem.description == ''
			|| !$scope.problem.email || $scope.problem.email == '') {
			var alertPopup = $ionicPopup.alert({
				title: 'Uh Oh!',
				template: 'Please fill out the description and email before flagging the content.'
			});
			$scope.hide($ionicLoading);
			return ;
		}
		
		var date = new Date();
		$scope.problem.description = "[FLAGGED CONTENT] " + date.toString() + "; " + $scope.flagId + " : " + $scope.problem.description;
		
		report.reportAProblem($scope.problem)
		.error(function(error) {
			$scope.hide($ionicLoading);
			var alertPopup = $ionicPopup.alert({
				title: 'Uh Oh!',
				template: 'Something went wrong when flagging the content.'
			});
		})
		.success(function(data) {
			$scope.problem = { description: "", extra: "", email: "", user: auth.currentUsername()};
			$scope.hide($ionicLoading);
			var alertPopup = $ionicPopup.alert({
				title: 'Success!',
				template: 'You successfully flagged the content. Your email may be contacted for further inquiry.'
			});
			$scope.closeFlag();
		}).finally(function($ionicLoading) {
			$state.hide($ionicLoading);
		})
	}
	
	// DECK SAVE
	
	$ionicPopover.fromTemplateUrl('views/profile/save/save-deck.html', {
		scope: $scope
	}).then(function(popover) {
		$scope.saveDeckPopover = popover;
	});
	$scope.openSaveDeckPopover = function($event) {
		$scope.saveDeckPopover.show($event);
	};
	$scope.closeSaveDeckPopover = function() {
		$scope.saveDeckPopover.hide();
	};
	
	$scope.getDeckSaved = function() {
		for(var i = 0; i < $scope.myCourses.length; i++) {
			if($scope.myCourses[i].content.decks.map(function(x) { return x._id; }).indexOf($scope.deck.content._id) != -1) {
				$scope.myCourses[i].savedDeck = true;
			} else {
				$scope.myCourses[i].savedDeck = false;
			}
		}
		if($scope.myDecks.map(function(x) { return x.content._id; }).indexOf($scope.deck.content._id) != -1 && !$scope.deck.content.course) $scope.savedDeck = true;
		else if($scope.myDecks.map(function(x) { return x.content; }).indexOf($scope.deck.content._id) != -1 && !$scope.deck.content.course) $scope.savedDeck = true;
		else $scope.savedDeck = false;
	}
	
	$scope.getCourseSaved = function() {
		if($scope.myCourses.map(function(x) { return x.content._id; }).indexOf($scope.course.content._id) != -1 && !$scope.course) $scope.savedCourse = true;
		else if($scope.myCourses.map(function(x) { return x.content; }).indexOf($scope.course.content._id) != -1 && !$scope.course) $scope.savedCourse = true;
		else $scope.savedCourse = false;
	}
	
	$scope.saveToCourse = function(deck, course) {
		$scope.closeSaveDeckPopover();
		if((course && course.decks.map(function(x) { return x._id; }).indexOf(deck._id) != -1) || $scope.savedDeck) {
			var confirmPopup = $ionicPopup.confirm({
				title: 'Unsave Deck',
				template: 'Are you sure you want to unsave this deck? Your progress will also be gone.'
			});

			confirmPopup.then(function(res) {
				if(res) {
					$scope.show($ionicLoading);
					cards.unsaveDeck(deck).success(function() {
						var alertPopup = $ionicPopup.alert({
							title: 'Deck Unsaved',
							template: 'You have successfully unsaved the deck.'
						});
						$scope.refreshDeck($scope.deck.content._id);
					}).error(function() {
						var alertPopup = $ionicPopup.alert({
							title: 'Uh Oh!',
							template: 'Something went wrong when unsaving the deck.'
						});
					}).finally(function($ionicLoading) {
						$scope.hide($ionicLoading);
					}); 
				}
			});
		} else {
			$scope.show($ionicLoading);
			cards.saveDeck(deck, course).success(function() {
				var alertPopup = $ionicPopup.alert({
					title: 'Deck Saved',
					template: 'You have successfully saved the deck.'
				});
				$scope.refreshDeck($scope.deck.content._id);
			}).error(function() {
				var alertPopup = $ionicPopup.alert({
					title: 'Uh Oh!',
					template: 'Something went wrong when saving the deck.'
				});
			}).finally(function($ionicLoading) {
				$scope.hide($ionicLoading);
			});
		}
	}
	
	// DECK EDIT
	
	$scope.showMediaOptions = function(type) {
		$scope.hideSheet = $ionicActionSheet.show({
			buttons: [
			          { text: 'Take New Photo' },
			          { text: 'Select Photo' }
//			          { text: 'Take New Video' },
//			          { text: 'Select Video' },
//			          { text: 'Paste Link'}
			          ],
			          titleText: 'Upload media',
			          cancelText: 'Cancel',
			          cancel: function() {
			        	  // add cancel code..
			          },
			          buttonClicked: function(index) {
			        	  $scope.addImage(index, type);
			        	  return true;
			          }
		});
	};

	$scope.addImage = function(index, type) {
		$scope.hideSheet();
		ImageService.handleMediaDialog(index).then(function(res) {
			if(type == "deck") {
				$scope.deck.content.image = res;
			} else if(type == "course") {
				$scope.course.content.image = res;
			}
		});
	}
	
	$scope.showCancelOptions = function(type) {
		var hideSheet = $ionicActionSheet.show({
			buttons: [
			          
			          ],
			          titleText: 'Close',
			          destructiveText: 'Discard Draft',
			          cancelText: 'Cancel',
			          cancel: function() {
			        	  // add cancel code..
			          },
			          buttonClicked: function(index) {
			        	  if(index == 0) {

			        	  }
			          },
			          destructiveButtonClicked: function() {
			        	  $ionicHistory.goBack(-1);
			          }
		});
	};
	
	$('#deck-course').change(function() {
		$scope.selectedCourse = JSON.parse($('#deck-course option:selected').val());
		if($scope.selectedCourse != null) {
			$scope.deck.content.course = $scope.selectedCourse;
			$scope.deck.content.lang1 = $scope.deck.course.lang1;
			$scope.deck.content.lang2 = $scope.deck.course.lang2;
			$scope.deck.content.categories = $scope.deck.course.categories;
		}
	})
	
	$scope.updateDeckContent = function() {
		if($scope.deck.content.course != null && $scope.deck.content.course.content == "null") {
			$scope.deck.content.course = null;
		} else if($scope.deck.content.course != null && checkJSON($scope.deck.content.course.content)) {
			$scope.deck.content.course.content = JSON.parse($scope.deck.content.course.content);
		}
		$scope.show($ionicLoading);
		if(!$scope.deck.content.name || $scope.deck.content.name === ''
			|| !$scope.deck.content.lang1 || !$scope.deck.content.lang2
			|| !$scope.deck.content.categories
			|| !$scope.deck.content.image) {
			$scope.hide($ionicLoading);
			var alertPopup = $ionicPopup.alert({
				title: 'Uh Oh!',
				template: 'Please fill out missing fields on your deck before creating it.'
			});
			return;
		} else if(BadFilter.containBadWords($scope.deck.content.name)) {
			var alertPopup = $ionicPopup.alert({
				title: 'Uh Oh!',
				template: 'Please do not create objectionable content.'
			});
			$scope.hide($ionicLoading);
			return ;
		}
		cards.updateDeck($scope.deck).success(function() {
			var alertPopup = $ionicPopup.alert({
				title: 'Success',
				template: 'The deck was updated successfully.'
			});
			$scope.hide($ionicLoading);
			$ionicHistory.goBack(-1);
		}).error(function() {
			$scope.hide($ionicLoading);
			var alertPopup = $ionicPopup.alert({
				title: 'Uh Oh!',
				template: 'Something went wrong when updating the deck.'
			});
		})
	}
	
	// DECK DELETE
	
	$scope.showDeleteDeck = function() {
		var confirmPopup = $ionicPopup.confirm({
			title: 'Delete Deck',
			template: 'Are you sure you want to delete this deck?'
		});

		confirmPopup.then(function(res) {
			if(res) {
				$scope.show($ionicLoading);
				cards.deleteDeck($scope.deck.content._id).success(function() {
					var alertPopup = $ionicPopup.alert({
						title: 'Success',
						template: 'The deck was deleted successfully.'
					});
					$ionicHistory.goBack(-2);
				}).error(function() {
					var alertPopup = $ionicPopup.alert({
						title: 'Uh Oh!',
						template: 'Something went wrong when deleting the deck.'
					});
				}).finally(function($ionicLoading) {
					$scope.hide($ionicLoading);
				});
			}
		});
	};
	
	/* COURSE */
	
	/* KEY VARIABLES:
	 * 		courseFinished
	 * 		courseTemplate
	 */
	
	$scope.courseFinished = false;
	$scope.courseTemplate = "views/profile/view-course/view-course-decks.html";
	
	/* KEY FUNCTIONS:
	 * 		countFinishedCards
	 * 		countNumCards
	 * 		isEmpty
	 * 		refreshCourse
	 * 		refreshCourses
	 * 		initializeCourse
	 * 		startCourse
	 * 		learnCourse
	 * 		reviewCourse
	 * 		testCourse
	 * 		resetCourse
	 */
	
	/* KEY SECTIONS:
	 * 		course options
	 * 		course view
	 * 		course save
	 * 		course comments
	 * 		course edit
	 * 		course delete
	 */
	
	$scope.countFinishedCards = function() {
		var sum = 0;
		// i is the deck in the course
		for(var i = 0; i < $scope.deckIndex; i++) {
			sum += $scope.course.content.decks[i].content.cards.length;
		}
		if($scope.deckIndex < $scope.course.content.decks.length) {
			cards.getDeckProgress($scope.course.content.decks[$scope.deckIndex]).success(function(data) {
				sum += data.cardIndex;
			});
			return sum;
		} else {
			return sum;
		}
	}
	
	$scope.countNumCards = function() {
		var sum = 0;
		for(var i = 0; i < $scope.course.content.decks.length; i++) {
			sum += $scope.course.content.decks[i].cards.length;
		}
		return sum;
	}
	
	$scope.isEmpty = function() {
		$scope.sumCards = $scope.countNumCards();
		$scope.emptyCardsInCourse = $scope.sumCards == 0;
	}
	
	$scope.refreshCourse = function(id) {
		$scope.course = {};
		$scope.course.content = { updatedAt: ""};
		$scope.show($ionicLoading);
		cards.getCourse(id, true, true, true).success(function(data) {
			$scope.course = cards.currentCourse;
			$scope.emptyDecksInCourse = $scope.course.content.decks.length == 0;
			$scope.isEmpty();
			$scope.refreshComments('course');
			cards.getCourseProgress($scope.course.content._id).success(function(data) {
				if(data) {
					$scope.progress = data;
					$scope.deckIndex = $scope.progress.deckIndex;
					if($scope.deckIndex == $scope.course.content.decks.length) {
						$scope.courseFinished = true;
					}
					$scope.updateCourse($scope.deckIndex);
					$scope.reviewProgress = Math.floor($scope.deckIndex/$scope.course.content.decks.length*100);
				} else $scope.reviewProgress = Math.floor(0/$scope.course.content.decks.length*100);
			});
		})
		.finally(function() {
			$scope.hide($ionicLoading);
			$scope.$broadcast('scroll.refreshComplete');
		});
	};
	
	$scope.refreshCourses = function() {
		cards.getAll("Courses")
		.success(function(data) {
			$scope.myCourses = data;
			$scope.getDeckSaved();
		})
		.finally(function() {
			$scope.$broadcast('scroll.refreshComplete');
		});
	}

	$scope.initializeCourse = function() {
		$scope.emptyDecksInCourse = $scope.course.content.decks.length == 0;
		$scope.inDeck = false;
	}
	
	$scope.startCourse = function(mode) {
		$scope.checkIfSaved("course").success(function(){
			$scope.initializeCourse();
			// check if deck has cardIndex > deck.cards.length, then deckIndex++
			$scope.checkDeckIndex();
			
			if(mode == "learn") {
				$scope.learnCourse();
			} else if(mode == "review") {
				$scope.reviewCourse();
			} else if(mode == "test") {
				$scope.testCourse();
			}
		});
	}
	
	$scope.learnCourse = function() {
		// in learn deck mode
//		if($scope.course.content && $scope.deckIndex < $scope.course.content.decks.length) {
			if($scope.course.content.decks[$scope.deckIndex].content.cards.length != 0) {
				$scope.refreshDeck($scope.course.content.decks[$scope.deckIndex].content._id, true);
			} else {
				var alertPopup = $ionicPopup.alert({
					title: 'Uh Oh!',
					template: 'The next deck in the course is empty.'
				});
			}
//		}
	}
	
	$scope.reviewCourse = function() {
		$scope.reviewMode = [true, false];
		$scope.showCardParts.showMagic = false;
		//new function that gets all the cards from the course
		//start review mode
	}
	
	$scope.testCourse = function() {
		$scope.testMode = [true, false];
		$scope.showCardParts.showMagic = false;
		//new function that gets all the cards from the course
		//start test mode
	}
	
	$scope.resetCourse = function() {
		var confirmPopup = $ionicPopup.confirm({
			title: 'Reset Course',
			template: 'Are you sure you want to start over? All your progress will be erased.'
		});

		confirmPopup.then(function(res) {
			if(res) {
				$scope.deckIndex = 0;
				$scope.course.content.decks[0].progress.cardIndex = 0;
				$scope.goBackToDeckCourse();
			}
		});
	};
	
	// COURSE OPTIONS
	
	$ionicPopover.fromTemplateUrl('views/profile/view-course/view-course-options.html', {
		scope: $scope
	}).then(function(popover) {
		$scope.courseOptionsPopover = popover;
	});

	$scope.firstCourseEnter = true;
	$scope.courseView = { checked: false };
	$scope.openCourseOptionsPopover = function($event) {
		$scope.courseOptionsPopover.show($event);
		if($scope.firstCourseEnter) {
			$('.side-switch').change(function() {
				$scope.checkCourseViewSwitch();
			})
			$scope.firstCourseEnter = false;
		}
	};
	
	$scope.closeCourseOptionsPopover = function() {
		$scope.courseOptionsPopover.hide();
	};
	
	// COURSE VIEW
	
	$scope.checkCourseViewSwitch = function() {
		if(!$scope.courseView.checked) {
			$('.deck-list').removeClass('active');
			$('.phrase-list').addClass('active');
		} else {
			$('.deck-list').addClass('active');
			$('.phrase-list').removeClass('active');
		}
	}
	
	// ???
	
	$scope.updateCourse = function(index) {
		if(!$scope.courseFinished) {
			$scope.deck = $scope.course.content.decks[index];
		}
	}
	
	// COURSE SAVE
	
	$scope.saveCourse = function(course) {
		if($scope.course.content.saved.indexOf($scope.currentUser._id) != -1) {
			var confirmPopup = $ionicPopup.confirm({
				title: 'Unsave Course',
				template: 'Are you sure you want to unsave this course? Your progress will also be gone.'
			});

			confirmPopup.then(function(res) {
				if(res) {
					$scope.show($ionicLoading);
					cards.unsaveCourse(course).success(function() {
						var alertPopup = $ionicPopup.alert({
							title: 'Course Unsaved',
							template: 'You have successfully unsaved the course.'
						});
					}).error(function() {
						var alertPopup = $ionicPopup.alert({
							title: 'Uh Oh!',
							template: 'Something went wrong when unsaving the course.'
						});
					}).finally(function($ionicLoading) {
						$scope.hide($ionicLoading);
					}); 
				}
			});
		} else {
			$scope.show($ionicLoading);
			cards.saveCourse(course).success(function() {
				var alertPopup = $ionicPopup.alert({
					title: 'Course Saved',
					template: 'You have successfully saved the course.'
				});
			}).error(function() {
				var alertPopup = $ionicPopup.alert({
					title: 'Uh Oh!',
					template: 'Something went wrong when saving the course.'
				});
			}).finally(function($ionicLoading) {
				$scope.hide($ionicLoading);
			});
		}
	}

	// COURSE COMMENTS
	
	$ionicModal.fromTemplateUrl('views/profile/view-course/view-course-comments.html', {
		scope: $scope,
		animation: 'slide-in-up'
	}).then(function(modal) {
		$scope.courseCommentsModal = modal;
	});

	$scope.showCourseComments = function() {
		$scope.courseComments = true;
		$scope.courseCommentsModal.show();
	};
	$scope.closeCourseComments = function() {
		$scope.courseCommentsModal.hide();
		$scope.courseComments = false;
	};
	
	$scope.refreshComments = function(type) {
		if(type == null) {
			cards.getCard($scope.card._id, true)
			.success(function(data){
				$scope.card = data.card;
			})
			.finally(function() {
				$scope.$broadcast('scroll.refreshComplete');
			});
		} else if(type == 'course') {
			cards.getCourse($scope.course.content._id, true, true, true)
			.success(function(data){
				$scope.course = cards.currentCourse;
			})
			.finally(function() {
				$scope.$broadcast('scroll.refreshComplete');
			});
		}
	}
	
	$scope.comment = {};
	$scope.addCourseComment = function(course) {
		$scope.show($ionicLoading);
		if(!$scope.comment.content || $scope.comment.content === '') {
			$scope.hide($ionicLoading);
			return;
		}
		cards.addCourseComment({
			content: $scope.comment.content,
			course: course,
			avatar: $scope.currentUser.avatar
		}).success(function() {
			$scope.comment.content = "";
			$scope.refreshComments('course');
		}).error(function() {
			var alertPopup = $ionicPopup.alert({
				title: 'Uh Oh!',
				template: 'Something went wrong when publishing your comment.'
			});
		}).finally(function($ionicLoading) {
			$scope.hide($ionicLoading);
		});
	};
	$scope.loveComment = function(comment) {
		cards.loveComment(comment);
	};
	
	// COURSE EDIT
	
	$scope.updateCourseContent = function() {
		$scope.show($ionicLoading);
		if(!$scope.course.content.name || $scope.course.content.name === ''
			|| !$scope.course.content.caption || !$scope.course.content.lang1
			|| !$scope.course.content.lang2 || !$scope.course.content.categories
			|| !$scope.course.content.difficulty || !$scope.course.content.image) {
			$scope.hide($ionicLoading);
			var alertPopup = $ionicPopup.alert({
				title: 'Uh Oh!',
				template: 'Please fill out missing fields on your course before creating it.'
			});
			return;
		} else if(BadFilter.containBadWords($scope.course.content.name) ||
				BadFilter.containBadWords($scope.course.content.caption)) {
			var alertPopup = $ionicPopup.alert({
				title: 'Uh Oh!',
				template: 'Please do not create objectionable content.'
			});
			$scope.hide($ionicLoading);
			return ;
		} else if($scope.course.content.caption.length > 130) {
			$scope.hide($ionicLoading);
			var alertPopup = $ionicPopup.alert({
				title: 'Uh Oh!',
				template: 'You exceeded the character limit for the course caption.'
			});
			return;
		}
		cards.updateCourse($scope.course).success(function() {
			var alertPopup = $ionicPopup.alert({
				title: 'Success',
				template: 'The course was updated successfully.'
			});
			$scope.hide($ionicLoading);
			$ionicHistory.goBack(-1);
		}).error(function() {
			$scope.hide($ionicLoading);
			var alertPopup = $ionicPopup.alert({
				title: 'Uh Oh!',
				template: 'Something went wrong when updating the course.'
			});
		})
	}
	
	// COURSE DELETE
	
	$scope.showDeleteCourse = function() {
		var confirmPopup = $ionicPopup.confirm({
			title: 'Delete Course',
			template: 'Are you sure you want to delete this course?'
		});

		confirmPopup.then(function(res) {
			if(res) {
				$scope.show($ionicLoading);
				cards.deleteCourse($scope.course.content._id).success(function() {
					var alertPopup = $ionicPopup.alert({
						title: 'Success',
						template: 'The course was deleted successfully.'
					});
					$ionicHistory.goBack(-2);
				}).error(function() {
					var alertPopup = $ionicPopup.alert({
						title: 'Uh Oh!',
						template: 'Something went wrong when deleting the course.'
					});
				}).finally(function($ionicLoading) {
					$scope.hide($ionicLoading);
				});
			}
		});
	};

	/* LEARN, REVIEW, TEST MODE */
	
	/* KEY VARIABLES:
	 * 		Array boolean deckCourseMode	[learn, review, test] // USER SELECTS in deck/course view
	 * 		Array boolean learnMode			[cards, mini, review, finished] // based on cardIndex
	 * 		Array boolean reviewMode		[review, finished]
	 * 		Array boolean testMode			[test, finished]
	 * 		
	 * 		boolean inDeck					true if in deck, false if in course
	 * 
	 * 		boolean showCardParts.showMagic	true by default in card view; false by default in learn mode // USER TOGGLES in card options	
	 * 		boolean startedLearn			true if user started learn mode: if cardIndex > 0 or deckIndex > 0
	 * 		boolean finishedLearn			true if user finished learn mode: if cardIndex == cards.length or deckIndex == decks.length
	 * 
	 * 		keyboardTemplate	
	 */
	
	/* MODE KEY:
	 * 
	 * MINI = MULTIPLE CHOICE + SPELLING
	 * REVIEW = ALL CARDS OR CARDS SO FAR
	 * TEST = REVIEW + COMPREHENSION EXERCISES
	 * 
	 * 1. LEARN  = LEARN CARDS --> LEARN MINI --> LEARN REVIEW/TEST --> LEARN DECK FINISHED --> LEARN COURSE FINISHED
	 * 2. REVIEW = REVIEW --> REVIEW FINISHED
	 * 3. TEST   = TEST --> TEST FINISHED
	 */
	
	$scope.deckCourseMode = [false, false, false];
	$scope.learnMode = [false, false, false, false];
	$scope.reviewMode = [false, false];
	$scope.testMode = [false, false];
	
	// true for deck, false for course
	$scope.inDeck = true;
	
	$scope.showCardParts.showMagic = true;
	$scope.startedLearn = false;
	$scope.finishedLearn = true;
	
	$scope.keyboardTemplate = "views/profile/mini/keyboards/keyboard-english-type.html";
	
	/* KEY FUNCTIONS:
	 * 
	 * 		1. GENERAL
	 * 			checkIfSaved
	 * 			showDeckCourseModes
	 * 			deckCourseModeClicked
	 * 			setDeckCourseMode
	 * 			setLearnMode
	 * 			setReviewMode
	 * 			setTestMode
	 * 			goBackToDeckCourse
	 * 			
	 * 		2. LEARN
	 * 			a. LEARN CARDS
	 * 				deckReviewModal
	 * 				cardDestroyed, cardSwiped
	 * 				updateDeck
	 * 				reviewSettings: checkLangSwitch, shuffle
	 * 				reviewHelp
	 * 				metacards: updateMetaCard, nextMeta, backMeta, checkMeta
	 * 				setProgress
	 * 			b. LEARN MINI
	 * 				initializeMini
	 * 				initializeMiniLearn
	 * 				startMini
	 * 				getRandomIndex
	 * 				getMinis
	 * 				getWhichKeyboard
	 * 				getChoices
	 * 				checkChoice
	 * 				next
	 * 				getMini
	 * 				checkDoneAndContinue
	 * 				isDone
	 * 				playAudio
	 * 
	 * 		3. REVIEW
	 * 			initializeMiniReview
	 * 			continueReview
	 * 			checkDeckIndex
	 * 			setMiniProgress
	 * 
	 * 		4. TEST
	 * 			initializeFinalReview
	 * 			checkLanguages: checkFirstLanguage, checkSecondLanguage
	 * 			checkBadges
	 * 
	 * 		5. KEYBOARD
	 * 			setupKeyboardAnyType
	 * 			deleteArrayDuplicates
	 * 			setupKeyboardChineseType
	 * 			setupKeyboardEnglishType
	 */
	
	// GENERAL
	
	$scope.checkIfSaved = function(type) {
		if(type == "deck") {
			return cards.getDeckProgress($scope.deck.content._id).success(function(data) {
				if(!data) {
					cards.saveDeck($scope.deck.content);
					$scope.cardIndex = 0;
				} else 
					$scope.cardIndex = data.cardIndex;
			});
		} else if(type == "course") {
			return cards.getCourseProgress($scope.course.content._id).success(function(data) {
				if(!data) {
					cards.saveCourse($scope.course.content);
					$scope.deckIndex = 0;
				} else 
					$scope.deckIndex = data.deckIndex;
			});
		}
	}
	
	$scope.showDeckCourseModes = function(type) {
		if(type=="deck") { 
			$scope.startedLearn = ($scope.deck.progress.cardIndex > 0);
			$scope.finishedLearn = ($scope.deck.progress.cardIndex >= $scope.deck.content.cards.length);
		} else if(type=="course") { 
			$scope.startedLearn = ($scope.course.progress.deckIndex > 0 || $scope.course.content.decks[0].progress.cardIndex > 0);
			$scope.finishedLearn = ($scope.course.progress.deckIndex >= $scope.course.content.decks.length);
		}
		$('.wrap').toggleClass('active');
	    
	};
	
	$scope.deckCourseModeClicked = function (mode, type) {
		$scope.setDeckCourseMode(mode);
		if(type == "deck") {
			$scope.startDeck(mode);
		} else if(type == "course"){
			$scope.startCourse(mode);
		}
	}
	
	$scope.setDeckCourseMode = function(mode) {
		if(mode == "learn") {
			$scope.deckCourseMode = [true, false, false];
		} else if(mode == "review") {
			$scope.deckCourseMode = [false, true, false];
		} else if(mode == "test") {
			$scope.deckCourseMode = [false, false, true];
		}
	}
	
	$scope.setLearnMode = function(isMiniMode) {
		$scope.reviewMode = [false, false];
		$scope.testMode = [false, false];
		if(isMiniMode) {
			$scope.learnMode = [false, true, false, false];
		} else if($scope.currentIndex < $scope.deck.content.cards.length) {
			$scope.learnMode = [true, false, false, false];
		} else if($scope.currentIndex == $scope.deck.content.cards.length) {
			$scope.learnMode = [false, false, true, false];
		} else if($scope.currentIndex > $scope.deck.content.cards.length) {
			$scope.learnMode = [false, false, false, true];
		}
	}
	
	$scope.setReviewMode = function(review) {
		$scope.learnMode = [false, false, false, false];
		$scope.testMode = [false, false];
		if(review) $scope.reviewMode = [true, false];
		else $scope.reviewMode = [false, true];
	}
	
	$scope.setTestMode = function(test) {
		$scope.learnMode = [false, false, false, false];
		$scope.reviewMode = [false, false];
		if(test) $scope.testMode = [true, false];
		else $scope.testMode = [false, true];
	}
	
	$scope.goBackToDeckCourse = function(clickedBack) {
		//IF FINISHED COURSE
		if(!$scope.inDeck) {
			$scope.show($ionicLoading);
			cards.updateCourseIndex($scope.course, $scope.progress, $scope.deckIndex).success(function(data) {
				if($scope.deckIndex > $scope.course.content.decks.length && $scope.learnMode[3]) {
					if(!clickedBack) {
						$scope.checkLanguages();
						$scope.checkBadges();
					} else {
						$scope.hide($ionicLoading);
					}
				} else {
					$scope.hide($ionicLoading);
				}
			})
		} //IF NOT FINISHED COURSE
		else if($scope.inDeck) {
			$scope.show($ionicLoading);
			if(!$scope.progress) $scope.progress = $scope.deck.progress;
			cards.updateDeckIndex($scope.deck.content, $scope.progress, $scope.currentIndex).success(function(data) {
				if($('.wrap')) $('.wrap').toggleClass('active');
				// If the deck is in a course
				if($scope.learnMode[3] && $scope.deck.content.course) {
					// Find the next unfinished deck in the course and update the deckIndex (only if it is greater than before)
					var courseID = "";
					if($scope.deck.content.course.content) courseID = $scope.deck.content.course.content._id;
					else courseID = $scope.deck.content.course;
					cards.getCourse(courseID).success(function(course) {
						cards.getCourseProgress(course.course._id).success(function(progress) {
							if($scope.deckIndex > progress.deckIndex) {
								cards.updateCourseIndex(course.course, progress, $scope.deckIndex)
								.finally(function($ionicLoading) {
									$scope.hide($ionicLoading);
								})
							} else {
								$scope.hide($ionicLoading);
							}
						})
					})
				} else {
					$scope.hide($ionicLoading);
				}
			})
		}
		if(clickedBack) {
			$scope.closeDeckReview();
		}
	}
	
	// LEARN
	
	// LEARN CARDS

	$ionicModal.fromTemplateUrl('views/profile/review/review-deck.html', {
		scope: $scope,
		animation: 'slide-in-up'
	}).then(function(modal) {
		$scope.reviewDeckModal = modal;
	});
	
	$scope.closeDeckReview = function() {
		$scope.reviewDeckModal.hide();
	};
	
	$scope.cardDestroyed = function(index) {
		$scope.setProgress($scope.reviewProgress);
		$scope.updateDeck($scope.currentIndex);
	}
	
	$scope.cardSwiped = function(index) {
		// check if learned two cards
		$scope.reviewProgress = Math.floor(++$scope.currentIndex/$scope.deck.content.cards.length*100);
		if(($scope.currentIndex)%2 == 0 && $scope.currentIndex != $scope.deck.content.cards.length) {
			$scope.initializeMiniLearn();
		}
	};
	
	$scope.updateDeck = function(index) {
		if(!$scope.learnMode[3] && $scope.thisDeck) {
			angular.copy($scope.deck.content.cards, $scope.thisDeck);
			$scope.thisDeck.splice(0, index);
			if($scope.thisDeck.length != 0) {
					$scope.card = $scope.thisDeck[0];
					$scope.checkLoveCard();
			}
		}
	}
	
	// REVIEW SETTINGS
	
	$ionicPopover.fromTemplateUrl('views/profile/review/review-settings.html', {
		scope: $scope
	}).then(function(popover) {
		$scope.reviewPopover = popover;
	});

	$scope.openReviewSettingsPopover = function($event) {
		$scope.reviewPopover.show($event);
		if($scope.firstEnter) {
			$('.side-switch').change(function() {
				$scope.checkLangSwitch();
			})
			$scope.firstEnter = false;
		}
	};
	$scope.closeReviewSettingsPopover = function() {
		$scope.reviewPopover.hide();
	};
	
	$scope.checkLangSwitch = function() {
		if($scope.side.checked) {
			$('card').removeClass('flip');
		} else {
			$('card').addClass('flip');
		}
	}

	//Fisher-Yates (aka Knuth) Shuffle
	function shuffleArray(array) {
		var currentIndex = array.length, temporaryValue, randomIndex;

		while (0 !== currentIndex) {

			randomIndex = Math.floor(Math.random() * currentIndex);
			currentIndex -= 1;

			temporaryValue = array[currentIndex];
			array[currentIndex] = array[randomIndex];
			array[randomIndex] = temporaryValue;
		}
		return array;
	}
	$scope.shuffle = function() {
		shuffleArray($scope.deck.content);
	};
	
	// REVIEW HELP
	
	$ionicPopover.fromTemplateUrl('views/profile/review/review-help.html', {
		scope: $scope
	}).then(function(popover) {
		$scope.reviewHelpPopover = popover;
	});

	$scope.openReviewHelpPopover = function($event) {
		$scope.reviewHelpPopover.show($event);
	};
	$scope.closeReviewHelpPopover = function() {
		$scope.reviewHelpPopover.hide();
	};
	
	// METACARDS
	
	$scope.metacardsArray = [];
	$scope.updateMetaCard = function(increase) {
		if($scope.checkMeta($scope.deckIndex, increase) != -1) {
			setTimeout(function() {
				$scope.hasMetacards = true;
				$scope.learnMode = [true, false, false, false];
				$scope.currentMetaIndex = $scope.checkMeta($scope.deckIndex, increase);
				var htmlBody = $scope.metacardsArray[$scope.currentMetaIndex].notes;
				var parser = new DOMParser();
				var doc = parser.parseFromString(htmlBody, "text/html");
				$('.metacard').css("display", "block");
				$('.metacard-body').empty();
				$('.metacard-body').append(doc.firstChild);
			 }, 1000);
		} else {
			$scope.hasMetacards = false;
		}
	}
	
	$scope.nextMeta = function() {
		if($scope.currentMetaIndex+1 == $scope.metacardsArray.length) {
			$('.metacard').hide();
		} else $scope.updateMetaCard(true);
	}
	
	$scope.backMeta = function() {
		if($scope.currentMetaIndex-1 != -1) {
			$scope.updateMetaCard(false);
		}
	}
	
	$scope.checkMeta = function(index, increase) {
		var metaIndex = $scope.currentMetaIndex;
		if(increase == true) metaIndex++;
		else if(increase == false) metaIndex--;
		else $scope.currentMetaIndex, metaIndex = 0;
		
		for(var i = metaIndex; i < $scope.metacardsArray.length; i++) {
		    if ($scope.metacardsArray[i].order == index) {
		        return i;
		    }
		}
		return -1;
	}
	
	// SET LEARN PROGRESS
	
	$scope.setProgress = function(setWidth) {
		var elem = document.getElementById("review-bar"); 
		elem.style.backgroundColor = '#00cc96';
		var width = $scope.reviewProgress;
		elem.style.width = width + '%'; 
		if(width) document.getElementById("label").innerHTML = width * 1 + '%';
		if($scope.reviewProgress == 100) {
			$scope.setLearnMode();
			$scope.reviewDeck();
			$scope.goBackToDeckCourse();
		}
	};
	
	// LEARN MINI
	
	$scope.initializeMini = function() {
		$scope.showCardParts.showMagic = false;
		$scope.showCorrectFront = false;
		$scope.showCorrectBack = false;
		$scope.showIncorrectFront = false;
		$scope.showIncorrectBack = false;
	}
	
	$scope.initializeMiniLearn = function() {
		$scope.initializeMini();
		
		$scope.doneCards = [];
		for(var i = 0; i < $scope.currentIndex; i++) {
			$scope.doneCards.push([false, false]);
		}
		$scope.setLearnMode(true);
		$scope.showCardParts.showMagic = false;
		$scope.startMini("mini");
	}
	
	$scope.startMini = function(type) {
		$scope.mini = ["views/profile/mini/dictation-mc.html",
			           "views/profile/mini/dictation-spell.html",
			           "views/profile/mini/dictation-trans-mc.html",
		               "views/profile/mini/dictation-trans-spell.html",
		               "views/profile/mini/translation-mc.html",
		               "views/profile/mini/translation-spell.html"];
		$scope.answer = "";
		$scope.count = 0;
		$scope.correctChoices = 0;
		$scope.correctChoice = "";
		
		$scope.getRandomIndex(type);
	}
	
	$scope.getRandomIndex = function() {
		// randomIndex is the index of the card in the doneCards array
		$scope.randomIndex = Math.floor(Math.random()*$scope.doneCards.length);
		while($scope.doneCards[$scope.randomIndex][0] && $scope.doneCards[$scope.randomIndex][1]) {
			$scope.randomIndex = Math.floor(Math.random()*$scope.doneCards.length);
		}
		if(!$scope.inDeck) {
			//find which deck the randomIndex is located in
			var i = 0;
			while($scope.randomIndex > $scope.lastIndexInDecks[i]) {
				i++;
			}
			if(!$scope.course.content.decks[i].content) {
				$scope.course.content.decks[i].content = $scope.course.content.decks[i];
			}
			cards.getDeck($scope.course.content.decks[i].content._id, true, true, true).success(function(data) {
				$scope.getChoices(cards.currentDeck.content.cards);
				$scope.getMinis();
			})
		} else if($scope.inDeck) {
			if($scope.learnMode[2] || $scope.reviewMode[0]) {
				$scope.getChoices($scope.deck.content.cards);
			} else if($scope.learnMode[1]) {
				$scope.getChoices($scope.deck.content.cards.slice(0, $scope.currentIndex));
			}
			$scope.getMinis();
		}
	}
	
	$scope.getMinis = function() {
		var previousMini = $scope.randomMini;
		$scope.randomMini = Math.floor(Math.random()*$scope.mini.length);
		while($scope.randomMini == previousMini) {
			$scope.randomMini = Math.floor(Math.random()*$scope.mini.length);
		}
		$scope.miniTemplate = $scope.mini[$scope.randomMini];
		
		if($scope.doneCards[$scope.randomIndex][0]) $scope.side.checked = true;
		else $scope.side.checked = false;
		
		if($scope.miniTemplate.lastIndexOf("spell") > -1) {
			if($scope.miniTemplate.lastIndexOf("trans") > -1) {
				if($scope.side.checked) {
					$scope.correctChoice = $scope.randomCard.frontphrase;
					$scope.getWhichKeyboard($scope.deck.content.lang1);
				} else {
					$scope.correctChoice = $scope.randomCard.backphrase;
					$scope.getWhichKeyboard($scope.deck.content.lang2);
				}
			} else {
				if($scope.side.checked) {
					$scope.correctChoice = $scope.randomCard.backphrase;
					$scope.getWhichKeyboard($scope.deck.content.lang2);
				} else {
					$scope.correctChoice = $scope.randomCard.frontphrase;
					$scope.getWhichKeyboard($scope.deck.content.lang1);
				}
			}
		}
	}
	
	$scope.getWhichKeyboard = function(language) {
		//setTimeout(function(){ $scope.setupKeyboardChineseType(); }, 1000);
		if(language == "Chinese") $scope.setupKeyboardAnyType(language);
		else if(language == "English") $scope.setupKeyboardEnglishType();
		else $scope.setupKeyboardAnyType(language);
	}
	
	$scope.getChoices = function(cards) {
		$scope.choices = [];
		$scope.isChoice = [];
		var i = 0;
		while(i < cards.length) {
			$scope.isChoice.push(false);
			i++;
		}
		//if in final/reviewfinal, using randomIndex, find real index in the current deck
		var realIndexInDeck = 0;
		if(!$scope.inDeck) {
			var i = 0;
			while($scope.randomIndex > $scope.lastIndexInDecks[i]) {
				i++;
			}
			realIndexInDeck = cards.length-($scope.lastIndexInDecks[i]-$scope.randomIndex)-1;
		} else {
			realIndexInDeck = $scope.randomIndex;
		}
		// creating the 4 choices
		if(cards.length >= 4) {
			for(var i = 0; i < 3; i++) {
				var randomChoiceIndex = Math.floor(Math.random()*cards.length);
				// choosing which 3 cards are the other choices, each unique
				while($scope.isChoice[randomChoiceIndex] 
					|| cards[randomChoiceIndex]._id == cards[realIndexInDeck]._id) {
					randomChoiceIndex = Math.floor(Math.random()*cards.length);
				}
				$scope.isChoice[randomChoiceIndex] = true;
				$scope.choices.push(cards[randomChoiceIndex]);
			}
			$scope.choices.push(cards[realIndexInDeck]);
			
		} else {
			angular.copy(cards, $scope.choices);
		}
		$scope.randomCard = cards[realIndexInDeck];
	}
	
	$scope.checkedAnswer = false;
	$scope.checkChoice = function(typeParam, choiceParam) {

		var choice;
		if(!choiceParam) {
			choice = $('.spell-form').val();
		} else choice = choiceParam;
		
//		var type;
//		if(!typeParam) {
//			// find out which type
//			if($scope.miniTemplate == "views/profile/mini/dictation-spell.html" && $scope.side.checked) type = 'front';
//			else if($scope.miniTemplate == "views/profile/mini/dictation-spell.html" && !$scope.side.checked) type = 'back';
//			else if($scope.miniTemplate == "views/profile/mini/dictation-trans-spell.html" && !$scope.side.checked) type = 'front';
//			else if($scope.miniTemplate == "views/profile/mini/dictation-trans-spell.html" && $scope.side.checked) type = 'back';
//			else if($scope.miniTemplate == "views/profile/mini/translation-spell.html" && !$scope.side.checked) type = 'front';
//			else if($scope.miniTemplate == "views/profile/mini/translation-spell.html" && $scope.side.checked) type = 'back';
//		} else {
//			type = typeParam;
//		}
		
		// now check answer
		if(!$scope.checkedAnswer) {
			// typeParam exists if miniTemplate is not spell
			if(typeParam) {
				var type = typeParam;
				if(type == "front") {
					if(choice == $scope.randomCard.backphrase) {
						$scope.correctChoices++;
						$scope.isCorrect = true;
						$scope.showCorrectFront = true;
					} else {
						$scope.isCorrect = false;
						$scope.showIncorrectFront = true;
					}
					$scope.checkedAnswer = true;
				} else if(type == "back") {
					if(choice == $scope.randomCard.frontphrase) {
						$scope.correctChoices++;
						$scope.isCorrect = true;
						$scope.showCorrectFront = true;
					} else {
						$scope.isCorrect = false;
						$scope.showIncorrectFront = true;
					}
					$scope.checkedAnswer = true;
				}
			} else {
				if(choice == $scope.correctChoice) {
					$scope.correctChoices++;
					$scope.isCorrect = true;
					$scope.showCorrectBack = true;
				} else {
					$scope.isCorrect = false;
					$scope.showIncorrectBack = true;
				}
				$scope.checkedAnswer = true;
			}
		}
	}
	
	$scope.next = function() {
		$scope.showCorrectFront = false;
		$scope.showCorrectBack = false;
		$scope.showIncorrectFront = false;
		$scope.showIncorrectBack = false;
		$scope.checkedAnswer = false;
		$scope.answer = "";
		$scope.getMini();
	}
	
	$scope.getMini = function() {
		if($scope.isCorrect) {
			//if on second try (first is already true), mark second true
			if($scope.doneCards[$scope.randomIndex][0]) $scope.doneCards[$scope.randomIndex][1] = true;
			//if on first try (first is false), mark first true
			else $scope.doneCards[$scope.randomIndex][0] = true;
			$scope.count++;
		} else {
			//if missed, reset both first and second tries
			if($scope.doneCards[$scope.randomIndex][0]) $scope.count--;
			if($scope.doneCards[$scope.randomIndex][1]) $scope.count--;
			$scope.doneCards[$scope.randomIndex][0] = false;
			$scope.doneCards[$scope.randomIndex][1] = false;
		}
		$scope.isCorrect = false;
		if($scope.learnMode[2] || $scope.reviewMode[0] || $scope.testMode[0]) {
			$scope.miniProgress = Math.floor($scope.count/($scope.doneCards.length*2)*100);
			$scope.setMiniProgress($scope.miniProgress);
		}
		$scope.mini.splice($scope.randomMini, 1); //splice element from array
		if($scope.mini.length == 0) {
			$scope.mini = ["views/profile/mini/dictation-mc.html",
				           "views/profile/mini/dictation-spell.html",
				           "views/profile/mini/dictation-trans-mc.html",
			               "views/profile/mini/dictation-trans-spell.html",
			               "views/profile/mini/translation-mc.html",
			               "views/profile/mini/translation-spell.html"];
		}
		$scope.checkDoneAndContinue();
	}
	
	$scope.checkDoneAndContinue = function() {
		if(!$scope.isDone()) {
			$scope.getRandomIndex();
		} else {
			if($scope.learnMode[1]) {
				$scope.learnDeck();
			} else if($scope.learnMode[2]) {
				$scope.currentIndex++;
				if($scope.deckIndex) $scope.deckIndex++;
				$scope.learnDeck();
			} else if($scope.reviewMode[0]) {
				$scope.setReviewMode(false);
			} else if($scope.testMode[0]) {
				$scope.setTestMode(false);
			}
			$scope.goBackToDeckCourse();
		}
	}
	
	$scope.isDone = function() {
		for(var i = 0; i < $scope.doneCards.length; i++) {
			if(!$scope.doneCards[i][0] || !$scope.doneCards[i][1]) {
				return false;
			}
		}
		return true;
	}
	
	$scope.currentRecording = new Audio();
	$scope.playAudio = function(type) {
		if(type == "front") {
			$scope.currentRecording.src = $scope.randomCard.recordingFiles[0];
		} else if(type == "back") {
			$scope.currentRecording.src = $scope.randomCard.recordingFiles[2];
		}
		$scope.currentRecording.addEventListener('loadedmetadata', function() {
		    console.log("Playing " + $scope.currentRecording.src + ", for: " + $scope.currentRecording.duration + "seconds.");
		    $scope.currentRecording.play(); 
		    $('.phrase.dictation').addClass('active');
		});
		$scope.currentRecording.addEventListener("ended", function(){
		     $scope.currentRecording.currentTime = $scope.currentRecording.duration;
		     console.log("ended");
			$('.phrase.dictation').removeClass('active');
		});
	}
	
	// REVIEW
	
	$scope.initializeMiniReview = function() {
		$scope.initializeMini();
		
		$scope.doneCards = [];
		for(var i = 0; i < $scope.deck.content.cards.length; i++) {
			$scope.doneCards.push([false, false]);
		}
		$scope.miniMode = "review";
		$scope.startMini("mini");
	}
	
	$scope.continueReview = function() {
		if($scope.inDeck) {
			if($scope.learnMode[3]) {
				$scope.goBackToDeckCourse(true);
				//go to the next deck in the course if in a course
				//if in a course, $scope.learnMode = [true, false, false, false];
				//$scope.initializeFinalReview();
			} else if($scope.reviewMode[1]) {
				$scope.goBackToDeckCourse(true);
			} else if($scope.testMode[1]) {
				$scope.goBackToDeckCourse(true);
			}
		} else {
			$scope.goBackToDeckCourse(true);
		}
	}
	
	$scope.checkDeckIndex = function() {
		if($scope.deckIndex < $scope.course.content.decks.length && $scope.course.content.decks[$scope.deckIndex].progress.cardIndex > $scope.course.content.decks[$scope.deckIndex].content.cards.length) {
			$scope.deckIndex++;
			cards.updateCourseIndex($scope.course, $scope.progress, $scope.deckIndex);
		}
	}
	
	$scope.setMiniProgress = function(setWidth) {
		var elem = $("#mini-bar");
		if(elem) {
			elem.css('background-color', '#11a3ed');
		}
//		if($scope.deck && $scope.currentIndex > $scope.deck.content.cards.length) $scope.miniProgress = 100;
		var width = $scope.miniProgress;
//		var id = setInterval(frame, 10);
//		function frame() {
//			if (width >= setWidth) {
//				clearInterval(id);
//			} else if(elem){
//				width++; 
		if(elem) {
			elem.css('width', width + "%"); 
			if(width) document.getElementById("label").innerHTML = width * 1 + '%';
		}
//			}
//		}
	}
	
	// TEST

	$scope.initializeFinalReview = function() {
		$scope.showCardParts.showMagic = false;
		$scope.showCorrectFront = false;
		$scope.showCorrectBack = false;
		$scope.showIncorrectFront = false;
		$scope.showIncorrectBack = false;
		
		$scope.doneCards = [];
		$scope.lastIndexInDecks = [];
		for(var i = 0; i < $scope.course.content.decks.length; i++) {
			if(i != 0) {
				$scope.lastIndexInDecks.push($scope.course.content.decks[i-1].content.cards.length-1 + $scope.course.content.decks[i].content.cards.length);
			} else if($scope.course.content.decks[i].content.cards.length != 0){
				$scope.lastIndexInDecks.push($scope.course.content.decks[i].content.cards.length-1);
			}
			for(var j = 0; j < $scope.course.content.decks[i].content.cards.length; j++) {
				$scope.doneCards.push([false, false]);
			}
		}
		if($scope.doneCards.length >= 4) {
			$scope.miniMode = "review";
			$scope.startMini("final");
		} else {
			$scope.goBackToDeckCourse(true);
			var alertPopup = $ionicPopup.alert({
				title: 'Uh Oh!',
				template: 'There are not enough cards in this course.'
			});
		}
	}
	
	$scope.checkLanguages = function() {
		// first language
		$scope.newLanguage1 = $scope.course.content.lang1;
		var updateLanguage = false;
		for(var i = 0; i < $scope.currentUser.languages.length; i++){
			if($scope.newLanguage1 == $scope.currentUser.languages[i].name) {
				if($scope.course.content.difficulty != $scope.currentUser.languages[i].level
						&& Misc.compareDifficulty($scope.currentUser.languages[i].level, $scope.course.content.difficulty)) updateLanguage = true;
				else $scope.newLanguage1 = "";
			}
		}
		if($scope.newLanguage1 != "" && !updateLanguage) {
			users.addLanguage({
				name: $scope.newLanguage1,
				level: $scope.course.content.difficulty,
				user: $scope.currentUser.username
			}).success(function(data) {
				// second language
				$scope.checkSecondLanguage();
				
				var alertPopup = $ionicPopup.alert({
					title: 'Wow!',
					template: 'You have learned a new language: ' + $scope.course.content.difficulty + ' ' + $scope.newLanguage1
				});
			})
		} else if($scope.newLanguage1 != "" && updateLanguage) {
			users.updateLanguage({
				name: $scope.newLanguage1,
				level: $scope.course.content.difficulty,
				user: $scope.currentUser.username
			}).success(function(data) {
				// second language
				$scope.checkSecondLanguage();
				
				var alertPopup = $ionicPopup.alert({
					title: 'Wow!',
					template: 'You have learned ' + $scope.course.content.difficulty + ' ' + $scope.newLanguage1
				});
			})
		}
	}
	
	$scope.checkSecondLanguage = function() {
		$scope.newLanguage2 = $scope.course.content.lang2;
		var updateLanguage = false;
		for(var i = 0; i < $scope.currentUser.languages.length; i++){
			if($scope.newLanguage2 == $scope.currentUser.languages[i].name) {
				if($scope.course.content.difficulty == $scope.currentUser.languages[i].level
						&& Misc.compareDifficulty($scope.currentUser.languages[i].level, $scope.course.content.difficulty)) updateLanguage = true;
				else $scope.newLanguage2 = "";
			}
		}
		if($scope.newLanguage2 != "" && !updateLanguage) {
			users.addLanguage({
				name: $scope.newLanguage2,
				level: $scope.course.content.difficulty,
				user: $scope.currentUser.username
			}).success(function(data) {
				var alertPopup = $ionicPopup.alert({
					title: 'Wow!',
					template: 'You have learned a new language: ' + $scope.course.content.difficulty + ' ' + $scope.newLanguage2
				});
			})
		} else if($scope.newLanguage2 != "" && updateLanguage) {
			users.updateLanguage({
				name: $scope.newLanguage2,
				level: $scope.course.content.difficulty,
				user: $scope.currentUser.username
			}).success(function(data) {
				var alertPopup = $ionicPopup.alert({
					title: 'Wow!',
					template: 'You have learned ' + $scope.course.content.difficulty + ' ' + $scope.newLanguage2
				});
			})
		}
	}
	
	$scope.checkBadges = function() {
		var hasBadge = false;
		for(var i = 0; i < $scope.currentUser.badges.length; i++){
			if($scope.course.content.name == $scope.currentUser.badges[i].name) {
				hasBadge = true;
			}
		}
		if(!hasBadge) {
			users.addBadge({
				name: $scope.course.content.name,
				lang1: $scope.course.content.lang1,
				lang2: $scope.course.content.lang2,
				difficulty: $scope.course.content.difficulty,
				user: $scope.currentUser.username
			}).success(function(data) {
				var alertPopup = $ionicPopup.alert({
					title: 'Congratulations!',
					template: 'You have finished the course and earned a badge.'
				});
			}).finally(function($ionicLoading) {
				$scope.hide($ionicLoading);
			})
		}
	}
	
	// KEYBOARD

	$scope.setupKeyboardAnyType = function(language) {
		$scope.characters = [];
		for(var i = 0; i < $scope.choices.length; i++) {
			if(language == $scope.deck.content.lang1) {
				for(var j = 0; j < $scope.choices[i].frontphrase.length; j++) {
					$scope.characters.push($scope.choices[i].frontphrase.charAt(j));
				}
			} else if(language == $scope.deck.content.lang2) {
				for(var j = 0; j < $scope.choices[i].backphrase.length; j++) {
					$scope.characters.push($scope.choices[i].backphrase.charAt(j));
				}
			}
		}
		$scope.characters = shuffleArray($scope.characters);
		$scope.characters = deleteArrayDuplicates($scope.characters);
		$scope.keyboardTemplate = "views/profile/mini/keyboards/keyboard-any-type.html";
		
		setTimeout(function(){ 
			$(".keyboard.any .row .white:not(:last)").mousedown(function(){
				$(".spell-form").append($(this).find("span").html().substring(0,1));
				$(this).find(".popout").css("display", "block");
				$(this).find(".popout .head").html($(this).find("span").html().substring(0,1));
				$(this).find("span").css("color", "transparent");
			});
			$(".keyboard.any .row .white:last").mousedown(function(){
				$(".spell-form").append("&#32;");
			});
			/* backspace */
			var backspace = function(){
				$(".spell-form").html($(".spell-form").html().substring(0,$(".spell-form").html().length-1));
			};
			for (var j = 0; j < kbdMode.length; ++j) {
				$("#" + kbdMode[j] + " .row:eq(2) .key:last").click(backspace);
			};
			$(".white").mouseup(function(){
				$(this).find(".popout").css("display", "none");
				$(this).find(".popout .head").html("");
				$(this).find("span").css("color", "#000");
			});
		 }, 1000);
	}
	
	var deleteArrayDuplicates = function(array) {
		var array;
		var uniqueArray = [];
		$.each(array, function(i, el){
		    if($.inArray(el, uniqueArray) === -1) uniqueArray.push(el);
		});
		return uniqueArray;
	}
	
	$scope.setupKeyboardChineseType = function() {
		$scope.keyboardTemplate = "views/profile/mini/keyboards/keyboard-chinese-hand.html";
	}
	
	$scope.setupKeyboardEnglishType = function () {
		var isShift = false,
		capsLock = false,
		isNumSymbols = false,
		isMoreSymbols = false;

		var kbdMode = ["lowercase", "uppercase", "numbers", "symbols"];
		$scope.keyboardTemplate = "views/profile/mini/keyboards/keyboard-english-type.html";

		setTimeout(function(){
			/* typing */
			for (var i = 0; i < kbdMode.length; ++i) {
				$("#" + kbdMode[i] + " .row .white:not(:last)").mousedown(function(){
					$(".spell-form").append($(this).find("span").html().substring(0,1));
					$(this).find(".popout").css("display", "block");
					$(this).find(".popout .head").html($(this).find("span").html().substring(0,1));
					$(this).find("span").css("color", "transparent");
				});
				$("#" + kbdMode[i] + " .row .white:last").mousedown(function(){
					$(".spell-form").append("&#32;");
				});
			}
			$(".white").mouseup(function(){
				$(this).find(".popout").css("display", "none");
				$(this).find(".popout .head").html("");
				$(this).find("span").css("color", "#000");
				if (isShift == true && capsLock == false) {
					$("#lowercase").css("display", "block");
					$("#uppercase").css("display", "none");
					isShift = false;
				}
			});
	
			/* toggle shift */
			//lowercase to uppercase
			$("#lowercase .row:eq(2) .gray:eq(0)").click(function(){
				if (isShift == false) {
					$("#lowercase").css("display", "none");
					$("#uppercase").css("display", "block");
					isShift = true;
				}
			});
			//uppercase to lowercase
			$("#uppercase .row:eq(2) .gray:eq(0)").click(function(){
				if (isShift == true) {
					$("#lowercase").css("display", "block");
					$("#uppercase").css("display", "none");
					isShift = false;
				}
			});
			//caps lock on
			$("#uppercase .row:eq(2) .gray:eq(0)").dblclick(function(){
				if (capsLock == false) {
					$("#lowercase").css("display", "none");
					$("#uppercase").css("display", "block");
					$(this).children("span").html("&#8682;");
					capsLock = true;
				}
			});
			//caps lock off
			$("#uppercase .row:eq(2) .gray:eq(0)").click(function(){
				if (capsLock == true) {
					$("#lowercase").css("display", "block");
					$("#uppercase").css("display", "none");
					$(this).children("span").html("&#11014;");
					capsLock = false;
				}
			});
	
			/* backspace */
			var backspace = function(){
				$(".spell-form").html($(".spell-form").html().substring(0,$(".spell-form").html().length-1));
			};
			for (var j = 0; j < kbdMode.length; ++j) {
				$("#" + kbdMode[j] + " .row:eq(2) .key:last").click(backspace);
			};
	
			/* toggle numbers */
			//lowercase/uppercase to numbers
			for (var k = 0; k < kbdMode.length-2; ++k) {
				$("#" + kbdMode[k] + " .row:eq(3) .gray:eq(0)").click(function(){
					if (isNumSymbols == false) {
						$("#numbers").css("display", "inherit");
						$("#lowercase").css("display", "none");
						$("#uppercase").css("display", "none");
						$("#uppercase .row:eq(2) .gray:eq(0)").children("span").html("&#11014;");
						isNumSymbols = true;
						isShift = false;
						capsLock = false;
					}
				});
			}
			//numbers to lowercase
			$("#numbers .row:eq(3) .gray:eq(0)").click(function(){
				if (isNumSymbols == true) {
					$("#numbers").css("display", "none");
					$("#lowercase").css("display", "block");
					isNumSymbols = false;
				}
			});
	
			/* toggle symbols */
			//numbers to symbols
			$("#numbers .row:eq(2) .gray:eq(0)").click(function(){
				if (isMoreSymbols == false) {
					$("#numbers").css("display", "none");
					$("#symbols").css("display", "block");
					isMoreSymbols = true;
				}
			});
			//symbols to numbers
			$("#symbols .row:eq(2) .gray:eq(0)").click(function(){
				if (isMoreSymbols == true) {
					$("#numbers").css("display", "block");
					$("#symbols").css("display", "none");
					isMoreSymbols = false;
				}
			});
			//symbols to lowercase
			$("#symbols .row:eq(3) .gray:eq(0)").click(function(){
				if (isMoreSymbols == true) {
					$("#lowercase").css("display", "block");
					$("#symbols").css("display", "none");
					isMoreSymbols = false;
				}
			});
	
			/* return (line break) */
			for (var l = 0; l < kbdMode.length; ++l) {
				$("#" + kbdMode[l] + " .row:eq(3) .gray:eq(1)").click(function(){
					$(".spell-form").append("&#10;");
				});
			}  
		}, 1000);
	};
}])