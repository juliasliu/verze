angular.module('App').controller('DeckCourseCtrl', [
'$rootScope',
'$ionicHistory',
'$scope',
'$state',
'$compile',
'$timeout',
"$ionicPopup",
'$ionicPopover',
'$ionicModal',
'$ionicActionSheet',
'$ionicLoading',
'$ionicHistory',
'ImageService',
'Misc',
'Language',
'LanguageFormat',
'DateFormat',
'auth',
'users',
'cards',
'report',
'ContentCheck',
'BadFilter',
function($rootScope, $ionicHistory, $scope, $state, $compile, $timeout, $ionicPopup, $ionicPopover, $ionicModal, $ionicActionSheet, $ionicLoading, $ionicHistory, ImageService, Misc, Language, LanguageFormat, DateFormat, auth, users, cards, report, ContentCheck, BadFilter) {

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
	$scope.categories = Misc.categories();
	$scope.levels = Misc.levels();
	$scope.colors = Misc.colors();
	$scope.findLanguage = Misc.findLanguage;
	$scope.findCategory = Misc.findCategory;
	$scope.findColor = Misc.findColor;
	$scope.getColor = Misc.getColor;
	
	// CONTENT CHECK
	$scope.isCardValid = function(card) {
		return ContentCheck.isCardValid(card);
	}
	$scope.isDeckValid = function(deck, editMode) {
		return ContentCheck.isDeckValid(deck, editMode);
	}
	$scope.isCourseValid = function(course, editMode) {
		return ContentCheck.isCourseValid(course, editMode);
	}
	$scope.isCardFiltered = function(card) {
		return ContentCheck.isCardFiltered(card);
	}
	$scope.isDeckFiltered = function(deck, editMode) {
		return ContentCheck.isDeckFiltered(deck, editMode);
	}
	$scope.isCourseFiltered = function(course, editMode) {
		return ContentCheck.isCourseFiltered(course, editMode);
	}
	
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
		if($ionicHistory.currentStateName().substr(0, 13) == 'editDeck') updateLanguage("deck");
		else if($ionicHistory.currentStateName().substr(0, 13) == 'editCourse') updateLanguage("course");
		$('.cards-trans').text($scope.language.cards);
		$('.decks-trans').text($scope.language.decks);
	});
	
	var updateLanguage = function(type) {
		if(type == "deck") {
			$('.edit-deck-trans').text($scope.language.editDeck);
			$('.name-of-deck-trans').text($scope.language.nameOfDeck);
			$('.course-trans').text($scope.language.course);
			$('.language-1-trans').text($scope.language.language1);
			$('.language-2-trans').text($scope.language.language2);
			$('.categories-trans').text($scope.language.categories);
			$('.image-trans').text($scope.language.image);
			$('.delete-deck-trans').text($scope.language.deleteDeck);
		} else if(type == "course") {
			$('.create-course-trans').text($scope.language.createCourse);
			$('.edit-course-trans').text($scope.language.editCourse);
			$('.name-of-course-trans').text($scope.language.nameOfCourse);
			$('.caption-trans').text($scope.language.caption);
			$('.language-1-trans').text($scope.language.language1);
			$('.language-2-trans').text($scope.language.language2);
			$('.difficulty-trans').text($scope.language.difficulty);
			$('.categories-trans').text($scope.language.categories);
			$('.image-trans').text($scope.language.image);
			$('.delete-course-trans').text($scope.language.deleteCourse);
		}
	}
	
	/* COPY AND PASTE ABOVE INTO EACH CTRL */

	/* REFRESH DECK, REFRESH COURSE */
	
	$scope.refreshDeck = function(id, mode) {
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
			if(mode) {
				$scope.startDeck(mode);
			}
			$scope.refreshCourses();
		})
		.finally(function() {
			$scope.hide($ionicLoading);
			$scope.$broadcast('scroll.refreshComplete');
			$('[data-toggle="tooltip"]').tooltip();
		});
	};
	
	$scope.refreshCourse = function(id) {
		$scope.course = {};
		$scope.course.content = { updatedAt: ""};
		$scope.show($ionicLoading);
		cards.getCourse(id, true, true, true).success(function(data) {
			$scope.course = cards.currentCourse;
			$scope.emptyDecksInCourse = $scope.course.content.decks.length == 0;
			$scope.viewCourseMode = true;
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
					$scope.deckCourseProgress = Math.floor($scope.deckIndex/$scope.course.content.decks.length*100);
				} else $scope.deckCourseProgress = Math.floor(0/$scope.course.content.decks.length*100);
			});
			$scope.initializeCourse();
		})
		.finally(function() {
			$scope.hide($ionicLoading);
			$scope.$broadcast('scroll.refreshComplete');
			$('[data-toggle="tooltip"]').tooltip();
		});
	};
	
	$scope.getUser = function() {
		
//		if($ionicHistory.currentStateName().substr(0, 13) == 'editDeck' || $ionicHistory.currentStateName().substr(0, 13) == 'editCourse') {
			if(auth.getUserAll() == "false") {
				cards.getAll([true, true, true], $scope.currentUser.username, true).success(function(data) {
					$scope.myCards = cards.myCards;
					$scope.myDecks = cards.myDecks;
					$scope.myCourses = cards.myCourses;
					$scope.cards = $scope.myCards;
					$scope.decks = $scope.myDecks;
					$scope.courses = $scope.myCourses;
					$scope.hide($ionicLoading);
				})
			} else {
				$scope.myCards = $scope.currentUser.cards;
				$scope.myDecks = $scope.currentUser.decks;
				$scope.myCourses = $scope.currentUser.courses;
				$scope.cards = $scope.myCards;
				$scope.decks = $scope.myDecks;
				$scope.courses = $scope.myCourses;
				$scope.hide($ionicLoading);
			}	
//		} else {
//			$scope.myCards = [];
//			$scope.myDecks = [];
//			$scope.myCourses = [];
//			angular.copy($scope.currentUser.cards, $scope.myCards);
//			angular.copy($scope.currentUser.decks, $scope.myDecks);
//			angular.copy($scope.currentUser.courses, $scope.myCourses);
//		}

		if($state.params.deck) {
			$scope.refreshDeck($state.params.deck);
		}
		if($state.params.course) {
			$scope.refreshCourse($state.params.course);
		}
	}
	
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
	
	$scope.onCardClick = function(id) {
		$state.go('viewCard', { card: id });
	}
	
	$scope.onDeckClick = function(id) {
		$state.go('viewDeck', { deck: id });
	}
	
	$scope.onEditDeckClick = function(id) {
		$state.go('editDeck', { deck: id });
	}
	
	$scope.onEditCourseClick = function(id) {
		$state.go('editCourse', { course: id });
	}
	
	$scope.$watch(function(newValues, oldValues) {
//		$('#review-bar').css({'width': $scope.reviewProgress+'%'});
//		$('#mini-bar').css({'width': $scope.miniProgress+'%'});
		
//		$('.deck-list .deck').each(function(index) {
//			if($scope.course && $scope.course.content && $scope.course.content.decks && $scope.course.content.decks[index] && $scope.course.content.decks[index].progress && $scope.course.content.decks[index].progress.cardIndex)
//				var pg = $scope.course.content.decks[index].progress.cardIndex/$scope.course.content.decks[index].content.cards.length*100;
//			if(pg == 0 || pg == undefined) {
//				pg = 100;
//				$(this).removeClass('complete');
//			} else $(this).addClass('complete');
//			$(this).append('<style>.course-view .deck:before{ width:'+pg+'%; }</style>');
//		});

		if(!$scope.deckCourseProgress || $scope.deckCourseProgress == 0) $scope.deckCourseProgress = 0;
		if($scope.deckCourseProgress > 100) $scope.deckCourseProgress = 100;
		$('#deck-course-progress-bar').css({'width': $scope.deckCourseProgress+'%'});
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
	
	$scope.showComments = false;
	$scope.showCardComments = function() {
		$scope.cardComments = true;
		if($scope.showComments == true) {
			$scope.showComments = false;
			$('.comments').addClass('ng-hide');
		} else {
			$scope.showComments = true;
			$('.comments').removeClass('ng-hide');
		}
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
	
	$scope.showCardParts = { showPronun: true, showExample: true, showMagic: true, showComments: true, showHover: false };

	$scope.hoverCard = function(hover) {
		if(hover) $scope.showCardParts.showHover = true;
		else $scope.showCardParts.showHover = false;
	}
	
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
		} else if($(".item.activated input").val() == "comments") {
			if (box.is(":checked")) {
				box.prop("checked", false);
				$scope.showCardParts.showComments = false;
			} else {
				box.prop("checked", true);
				$scope.showCardParts.showComments = true;
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
	
	$scope.initializeDeck = function() {
		$scope.emptyCardsInDeck = $scope.deck.content.cards.length == 0;
		$scope.firstEnter = true;
		$scope.vars = { language: true, keyboard: false };
		$scope.thisDeck = [];
		$scope.inDeck = true;
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
				if($scope.deckIndex != undefined && $scope.cardIndex == 0 && $scope.course != undefined && $scope.course.content != undefined) {
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
						if($scope.cardIndex == $scope.deck.content.cards.length) $scope.learnMode = [false, true, false];
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
			$scope.showCard = true;
			$scope.pausedCards = false;
			$scope.reviewProgress = Math.floor($scope.currentIndex/$scope.deck.content.cards.length*100);
			$scope.setProgress($scope.reviewProgress);
			$scope.updateDeck($scope.currentIndex);
		} else if($scope.currentIndex == $scope.deck.content.cards.length) {
			$scope.reviewDeck();
		} else if($scope.currentIndex > $scope.deck.content.cards.length) {
			$scope.testDeck();
		}
	}
	
	$scope.reviewDeck = function() {
		if(!$scope.learnMode[1]) $scope.setReviewMode(true);
		$scope.showCardParts.showMagic = false;
		$scope.reviewProgress = 100;
		$scope.miniProgress = 0;
		$scope.setMiniProgress($scope.miniProgress);
		$scope.updateDeck($scope.deck.content.cards.length);
		$scope.initializeReview("deck");
	}
	
	$scope.testDeck = function() {
		if(!$scope.learnMode[1]) $scope.setTestMode(true);
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
				$scope.learnDeck();
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
		if($scope.deckView.checked) {
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
	
	// MEDIA

	$scope.add = function() {

		$scope.f = document.getElementById('file').files[0];
		var r = new FileReader();
		r.onloadend = function(e) {
			var img = document.getElementById('image-preview');
			img.src = 'data:image/jpeg;base64,' + btoa(e.target.result);
			if($scope.card) $scope.card.image = img.src;
			if($scope.deck && $scope.deck.content) $scope.deck.content.image = img.src;
			if($scope.course && $scope.course.content) $scope.course.content.image = img.src;

		}
		r.readAsBinaryString($scope.f);
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
	
	var checkJSON = function checkJSON(str) {
	    try {
	        JSON.parse(str);
	    } catch (e) {
	        return false;
	    }
	    return true;
	}
	
	$('#deck-course').change(function() {
		$scope.selectedCourse = JSON.parse($('#deck-course option:selected').val());
		if($scope.selectedCourse != null) {
			$scope.deck.content.course = $scope.selectedCourse;
			$scope.deck.content.lang1 = $scope.deck.course.lang1;
			$scope.deck.content.lang2 = $scope.deck.course.lang2;
			$scope.deck.content.categories = $scope.deck.course.categories;
		}
	})
	
	$scope.addDeck = function() {
		if($scope.deck.content.course != null && $scope.deck.content.course.content == "null") {
			$scope.deck.content.course = null;
		} else if($scope.deck.content.course != null && checkJSON($scope.deck.content.course.content)) {
			$scope.deck.content.course.content = JSON.parse($scope.deck.content.course.content);
		}
		$scope.show($ionicLoading);
		if(!$scope.isDeckValid($scope.deck, true)) {
			$scope.hide($ionicLoading);
			var alertPopup = $ionicPopup.alert({
				title: 'Uh Oh!',
				template: 'Please fill out missing fields on your deck before creating it.'
			});
			return;
		} else if(!$scope.isDeckFiltered($scope.deck, true)) {
			var alertPopup = $ionicPopup.alert({
				title: 'Uh Oh!',
				template: 'Please do not create objectionable content.'
			});
			$scope.hide($ionicLoading);
			return ;
		}
		if($scope.f) $scope.deck.content.image = $scope.f;
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
	
	$scope.refreshCourses = function() {
		cards.getAll([false, false, true])
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
		$scope.vars = { language: true, keyboard: false };
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
				$scope.refreshDeck($scope.course.content.decks[$scope.deckIndex].content._id, "learn");
			} else {
				var alertPopup = $ionicPopup.alert({
					title: 'Uh Oh!',
					template: 'The next deck in the course is empty.'
				});
			}
			$scope.inCourse = true;
//		}
	}
	
	$scope.reviewCourse = function() {
		if(!$scope.learnMode[1]) $scope.setReviewMode(true);
		$scope.showCardParts.showMagic = false;
		$scope.inCourse = true;
		$scope.inDeck = false;
		$scope.reviewProgress = 100;
		$scope.miniProgress = 0;
		$scope.setMiniProgress($scope.miniProgress);
		//start review mode
		$scope.reviewDeckModal.show();
		$scope.initializeReview("course");
	}
	
	$scope.testCourse = function() {
		if(!$scope.learnMode[1]) $scope.setTestMode(true);
		$scope.showCardParts.showMagic = false;
		$scope.inCourse = true;
		$scope.inDeck = false;
		//start test mode
		$scope.reviewDeckModal.show();
		$scope.initializeTest();
	}
	
	$scope.resetCourse = function() {
		var confirmPopup = $ionicPopup.confirm({
			title: 'Reset Course',
			template: 'Are you sure you want to start over? All your progress will be erased.'
		});

		confirmPopup.then(function(res) {
			if(res) {
				$scope.deckIndex = 0;
				$scope.goBackToDeckCourse();
				resetDecks();
			}
		});
	};
	
	var resetDecks = function() {
		for(var i = 0; i < $scope.course.content.decks.length; i++) {
			$scope.deck = $scope.course.content.decks[i];
			cards.getDeckProgress($scope.deck.content._id).success(function(data) {
				$scope.progress = data;
				var index = $scope.course.content.decks.map(function(x) { return x.content._id }).indexOf($scope.progress.deck);
				$scope.deck = $scope.course.content.decks[index];
				$scope.currentIndex = 0;
				$scope.inDeck = true;
				$scope.goBackToDeckCourse();
			})
		}
	}
	
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
		if($scope.courseView.checked) {
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
	
	$scope.editCourseMode = true;
	
	$scope.addCourse = function() {
		$scope.show($ionicLoading);
		if(!$scope.isCourseValid($scope.course, true)) {
			$scope.hide($ionicLoading);
			var alertPopup = $ionicPopup.alert({
				title: 'Uh Oh!',
				template: 'Please fill out missing fields on your course before creating it.'
			});
			return;
		} else if(!$scope.isCourseFiltered($scope.course, true)) {
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
				template: 'You exceeded the 130 character limit for the course caption.'
			});
			return;
		}
		if($scope.f) $scope.course.content.image = $scope.f;
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
	 * 		Array boolean learnMode			[cards, review, finished] // based on cardIndex
	 * 		Array boolean reviewMode		[review, finished]
	 * 		Array boolean testMode			[test, finished]
	 * 		
	 * 		boolean inDeck					true if in deck, false if in course
	 * 		boolean inCourse				true if in course, even if inDeck is true
	 * 
	 * 		boolean showCardParts.showMagic	true by default in card view; false by default in learn mode // USER TOGGLES in card options	
	 * 		boolean startedLearn			true if user started learn mode: if cardIndex > 0 or deckIndex > 0
	 * 		boolean finishedLearn			true if user finished learn mode: if cardIndex == cards.length or deckIndex == decks.length
	 * 		
	 * 		viewDisabled					show a message if disabled button
	 * 
	 * 		keyboardTemplate				which keyboard for review mode is used
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
	$scope.learnMode = [false, false, false];
	$scope.reviewMode = [false, false];
	$scope.testMode = [false, false];
	
	// true for deck, false for course
	$scope.inDeck = true;
	
	$scope.showCardParts.showMagic = true;
	$scope.startedLearn = false;
	$scope.finishedLearn = true;
	
	// VIEW DISABLED *does not work for disabled buttons
	
//	$ionicPopover.fromTemplateUrl('views/profile/view-deck/view-disabled.html', {
//		scope: $scope
//	}).then(function(popover) {
//		$scope.viewDisabledPopover = popover;
//	});
//
//	$scope.openDisabled = function($event) {
//		$scope.viewDisabledPopover.show($event);
//	};
//	$scope.closeDisabled = function() {
//		$scope.viewDisabledPopover.hide();
//	};
//	
//	$scope.viewDisabled = function(mode) {
//		// show popover if button is disabled
//		$scope.showLearnDisabled, $scope.showReviewDisabled, $scope.showTestDisabled = false;
//		if(mode == 'learn') {
//			if($('#learn-btn').is(":disabled")) {
//				$scope.openDisabled($event);
//				$scope.showLearnDisabled = true;
//			}
//		} else if(mode == 'review') {
//			if($('#review-btn').is(":disabled")) {
//				$scope.openDisabled($event);
//				$scope.showReviewDisabled = true;
//			}
//		} else if(mode == 'test') {
//			if($('#test-btn').is(":disabled")) {
//				$scope.openDisabled($event);
//				$scope.showTestDisabled = true;
//			}
//		}
//	}
	
	$scope.keyboardTemplate = "views/profile/mini/keyboards/keyboard-english-type.html";
	
	/* LEARN/REVIEW/TEST FUNCTIONALITY */
	
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
	 * 				backCard, nextCard
	 * 				cardDestroyed, cardSwiped
	 * 				updateDeck
	 * 				reviewSettings: checkLanguageSwitch, checkKeyboardSwitch, shuffle, playCards, pauseCards
	 * 				toggleReviewSettings
	 * 				reviewHelp
	 * 				metacards: updateMetaCard, nextMeta, backMeta, checkMeta
	 * 				setProgress
	 * 			b. LEARN MINI
	 * 				initializeMini
	 * 				initializeMiniReview
	 * 				startMini
	 * 				getRandomIndex
	 * 				getMinis
	 * 				refillMinis
	 * 				checkTemplates
	 * 				getKeyboard
	 * 				getWhichKeyboard
	 * 				getChoices
	 * 				checkChoice
	 * 				compareNoCase
	 * 				cleanUpSpaces
	 * 				whichType
	 * 				markCorrect
	 * 				markIncorrect
	 * 				next
	 * 				getMini
	 * 				checkDoneAndContinue
	 * 				isDone
	 * 				playAudio
	 * 				getAudio
	 * 				playMetaCardAudio
	 * 
	 * 		3. REVIEW
	 * 			initializeReview
	 * 			continueReview
	 * 			checkDeckIndex
	 * 			setMiniProgress
	 * 			restartReview
	 * 
	 * 		4. TEST
	 * 			initializeTest
	 * 			checkMatch
	 * 			checkLanguages: checkFirstLanguage, checkSecondLanguage
	 * 			checkBadges
	 * 			restartTest
	 * 
	 * 		5. KEYBOARD
	 * 			deleteArrayDuplicates
	 * 			setupKeyboard
	 * 			setupKeyboardSpelling
	 * 			setupKeyboardChinese
	 * 			setupKeyboardEnglish
	 * 			syncKeyboard
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
			$scope.learnMode = [false, true, false];
		} else if($scope.currentIndex < $scope.deck.content.cards.length) {
			$scope.learnMode = [true, false, false];
		} else if($scope.currentIndex == $scope.deck.content.cards.length) {
			$scope.learnMode = [false, true, false];
		} else if($scope.currentIndex > $scope.deck.content.cards.length) {
			$scope.learnMode = [false, false, true];
		}
		$scope.showCardParts.showExample = false;
	}
	
	$scope.setReviewMode = function(review) {
		$scope.learnMode = [false, false, false];
		$scope.testMode = [false, false];
		if(review) $scope.reviewMode = [true, false];
		else $scope.reviewMode = [false, true];
	}
	
	$scope.setTestMode = function(test) {
		$scope.learnMode = [false, false, false];
		$scope.reviewMode = [false, false];
		if(test) $scope.testMode = [true, false];
		else $scope.testMode = [false, true];
	}
	
	$scope.goBackToDeckCourse = function(clickedBack) {
		if(!$scope.inDeck || $scope.inCourse) {
			$scope.show($ionicLoading);
			cards.updateCourseIndex($scope.course, $scope.course.progress, $scope.deckIndex).success(function(data) {
				if($scope.deckIndex > $scope.course.content.decks.length && $scope.learnMode[2]) {
					if(!clickedBack) {
						$scope.checkLanguages();
						$scope.checkBadges();
						users.addExp($scope.sumCards*Misc.getDifficultyValue($scope.course.content.difficulty));
					} else {
						$scope.hide($ionicLoading);
					}
				} else {
					$scope.hide($ionicLoading);
				}
			})
		}
		if($scope.inDeck) {
			$scope.show($ionicLoading);
//			if(!$scope.progress) $scope.progress = $scope.deck.progress;
			cards.updateDeckIndex($scope.deck.content, $scope.deck.progress, $scope.currentIndex).success(function(data) {
				if($('.wrap')) $('.wrap').toggleClass('active');
				// If the deck is in a course
				if($scope.learnMode[2] && $scope.deck.content.course) {
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
	
	// NEXT AND BACK CARD

	$('body').keyup(function(e){
		if($scope.learnMode[0]) {
			if(e.keyCode == 32){
				// user has pressed space
				if($('card').hasClass('flip')) $('card').removeClass('flip');
				else $('card').addClass('flip');
				return false;
			} else if(e.keyCode == 39) {
				// user has pressed right key arrow
				//$scope.nextCard();
			}
		}
	});
	
	$scope.nextCard = function() {
		// if metacards
		if($scope.hasMetacards) $scope.nextMeta();
		// else if cards
		else {
			$scope.cardSwiped($scope.currentIndex);
		}
	}
	
	$scope.backCard = function() {
		// if metacards
		if($scope.hasMetacards) $scope.backMeta();
	}
	
	$scope.cardDestroyed = function(index, next) {
		$scope.setProgress($scope.reviewProgress);
		$scope.updateDeck($scope.currentIndex);
	}
	
	$scope.cardSwiped = function(index) {
		// check if learned two cards
		$scope.reviewProgress = Math.floor(++$scope.currentIndex/$scope.deck.content.cards.length*100);
		if(($scope.currentIndex)%2 == 0 || $scope.currentIndex == $scope.deck.content.cards.length) {
			users.addExp(2);
			$scope.goBackToDeckCourse();
			$scope.initializeMiniReview();
		}
		$scope.cardDestroyed(index);
	};
	
	$scope.updateDeck = function(index) {
		if(!$scope.learnMode[2] && $scope.thisDeck) {
			angular.copy($scope.deck.content.cards, $scope.thisDeck);
			$scope.thisDeck.splice(0, index);
			if($scope.thisDeck.length != 0) {
				$scope.card = $scope.thisDeck[0];
				$scope.checkLoveCard();
			}
		}
	}
	
	// LEARN, REVIEW, TEST SETTINGS
	
	$ionicPopover.fromTemplateUrl('views/profile/review/settings-popovers/learn-settings.html', {
		scope: $scope
	}).then(function(popover) {
		$scope.learnSettingsPopover = popover;
	});
	$ionicPopover.fromTemplateUrl('views/profile/review/settings-popovers/review-settings.html', {
		scope: $scope
	}).then(function(popover) {
		$scope.reviewSettingsPopover = popover;
	});
	$ionicPopover.fromTemplateUrl('views/profile/review/settings-popovers/test-settings.html', {
		scope: $scope
	}).then(function(popover) {
		$scope.testSettingsPopover = popover;
	});

	$scope.openSettingsPopover = function($event, type) {
		if (type == "learn") $scope.learnSettingsPopover.show($event);
		else if (type == "review") $scope.reviewSettingsPopover.show($event);
		else if (type == "test") $scope.testSettingsPopover.show($event);
		
		if($scope.firstEnter) {
			$('.language-switch').change(function() {
				$scope.checkLanguageSwitch();
			})
			$('.keyboard-switch').change(function() {
				$scope.checkKeyboardSwitch();
			})
			$scope.firstEnter = false;
		}
	};
	$scope.closeSettingsPopover = function() {
		$scope.learnSettingsPopover.hide();
		$scope.reviewSettingsPopover.hide();
		$scope.testSettingsPopover.hide();
	};
	
	$scope.reviewSettings = { showReading: true, showListening: true, showSpelling: true, showTyping: false, showHandwriting: false, showSpeaking: false }
	
	$scope.toggleReviewSettings = function() {
		var box = $(".item.activated input:checkbox");
		if($(".item.activated input").val() == "reading") {
			if (box.is(":checked")) {
				box.prop("checked", false);
				$scope.reviewSettings.showReading = false;
			} else {
				box.prop("checked", true);
				$scope.reviewSettings.showReading = true;
			}
		} else if($(".item.activated input").val() == "listening") {
			if (box.is(":checked")) {
				box.prop("checked", false);
				$scope.reviewSettings.showListening = false;
			} else {
				box.prop("checked", true);
				$scope.reviewSettings.showListening = true;
			}
		} else if($(".item.activated input").val() == "spelling") {
			if (box.is(":checked")) {
				box.prop("checked", false);
				$scope.reviewSettings.showSpelling = false;
			} else {
				box.prop("checked", true);
				$scope.reviewSettings.showSpelling = true;
			}
		} else if($(".item.activated input").val() == "typing") {
			if (box.is(":checked")) {
				box.prop("checked", false);
				$scope.reviewSettings.showTyping = false;
			} else {
				box.prop("checked", true);
				$scope.reviewSettings.showTyping = true;
			}
		} else if($(".item.activated input").val() == "handwriting") {
			if (box.is(":checked")) {
				box.prop("checked", false);
				$scope.reviewSettings.showHandwriting = false;
			} else {
				box.prop("checked", true);
				$scope.reviewSettings.showHandwriting = true;
			}
		} else if($(".item.activated input").val() == "speaking") {
			if (box.is(":checked")) {
				box.prop("checked", false);
				$scope.reviewSettings.showSpeaking = false;
			} else {
				box.prop("checked", true);
				$scope.reviewSettings.showSpeaking = true;
			}
		}
	}
	
	$scope.checkLanguageSwitch = function() {
		if($scope.vars.language) {
			$('card').removeClass('flip');
		} else {
			$('card').addClass('flip');
		}
	}
	$scope.checkKeyboardSwitch = function() {
		if($scope.vars.keyboard) {
			$('.keyboard').removeClass('active');
			$('.keyboard-submit').addClass('active');
			$('.spell-form').prop( "disabled", false );
			$('.spell-form').prop( "readonly", false );
//			$('.spell-form').keyup(function(event) {
//		        $scope.checkChoice('', $('.spell-form').val(), true);
//		    });
		} else {
			$('.keyboard').addClass('active');
			$('.keyboard-submit').removeClass('active');
			$('.spell-form').prop( "disabled", true );
			$('.spell-form').prop( "readonly", true );
			$scope.getKeyboard();
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
	
	$scope.playCards = function() {
		$scope.pausedCards = false;
	}
	$scope.pauseCards = function() {
		$scope.pausedCards = true;
	}
	
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
			$scope.hasMetacards = true;
			$scope.currentMetaIndex = $scope.checkMeta($scope.deckIndex, increase);
			// get metacard from server
			$scope.show($ionicLoading);
			cards.getMetacard($scope.metacardsArray[$scope.currentMetaIndex]._id).success(function(data) {
				var htmlBody = data.metacard.notes;
				angular.copy(data.metacard.recordingFiles, $scope.metacardsArray[$scope.currentMetaIndex].recordingFiles);
				var parser = new DOMParser();
				var doc = parser.parseFromString(htmlBody, "text/html");
				$('.metacard').css("display", "block");
				$('.metacard-body').empty();
				$('.metacard-body').append(doc.firstChild);
				$compile($('.metacard-body')[0])($scope);
				$scope.hide($ionicLoading);
			})
		} else {
			$scope.hasMetacards = false;
		}
	}
	
	$scope.nextMeta = function() {
		if($scope.currentMetaIndex+1 == $scope.metacardsArray.length) {
			$('.metacard').hide();
			$scope.hasMetacards = false;
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
		if(width) $("#review-bar #label").innerHTML = width * 1 + '%';
	};
	
	// LEARN MINI
	
	// type 								"mini" or "final"
	
	$scope.initializeMini = function(type) {
		$scope.showCardParts.showMagic = false;
		$scope.showCorrectFront = false;
		$scope.showCorrectBack = false;
		$scope.showIncorrectFront = false;
		$scope.showIncorrectBack = false;
		if(!($scope.reviewMode[0] && $scope.inCourse) && !($scope.testMode[0] && $scope.inCourse)) $scope.inDeck = true;
	}
	
	$scope.initializeMiniReview	= function() {
		$scope.initializeMini("mini");
		
		$scope.doneCards = [];
		for(var i = 0; i < $scope.currentIndex; i++) {
			$scope.doneCards.push([false, false]);
		}
		$scope.setLearnMode(true);
		$scope.startMini("mini");
	}
	
	$scope.startMini = function(type) {
		$scope.refillMinis(type);
		
		$scope.answer = "";
		$scope.count = 0;
		$scope.correctChoices = 0;
		$scope.correctChoice = "";
		
		$scope.getRandomIndex(type);
	}
	
	$scope.getRandomIndex = function(type) {
		// randomIndex is the index of the card in the doneCards array
		$scope.randomIndex = Math.floor(Math.random()*$scope.doneCards.length);
		if(type == "mini") {
			while($scope.doneCards[$scope.randomIndex][0] && $scope.doneCards[$scope.randomIndex][1]) {
				$scope.randomIndex = Math.floor(Math.random()*$scope.doneCards.length);
			}
		} else if(type == "final") {
			while($scope.doneCards[$scope.randomIndex]) {
				$scope.randomIndex = Math.floor(Math.random()*$scope.doneCards.length);
			}
		}
		
		if(type == "final") {
//			//find which deck the randomIndex is located in
//			var i = 0;
//			while($scope.randomIndex > $scope.lastIndexInDecks[i]) {
//				i++;
//			}
//			if(!$scope.course.content.decks[i].content) {
//				$scope.course.content.decks[i].content = $scope.course.content.decks[i];
//			}
//			cards.getDeck($scope.course.content.decks[i].content._id, true, true, true).success(function(data) {
//				$scope.getChoices(cards.currentDeck.content.cards);
//				$scope.getMinis(type);
//			})
			
		} else if(type == "mini") {
			if($scope.reviewMode[0]) {
				if($scope.inCourse) {
					$scope.getChoices($scope.cardsInCourse, type);
				} else if($scope.inDeck) $scope.getChoices($scope.deck.content.cards.slice(0, $scope.deck.progress.cardIndex), type);
			} else if($scope.learnMode[1]) {
				$scope.getChoices($scope.deck.content.cards.slice(0, $scope.currentIndex), type);
			}
		}
		$scope.getMinis(type);
	}
	
	$scope.getMinis = function(type) {
		var previousMini = $scope.randomMini;
		$scope.randomMini = Math.floor(Math.random()*$scope.mini.length);
		if(type == "mini" && $scope.mini.length == 1) $scope.refillMinis("mini");
		else if(type == "final" && $scope.mini.length == 1) $scope.refillMinis("final");
		while($scope.randomMini == previousMini) {
			$scope.randomMini = Math.floor(Math.random()*$scope.mini.length);
		}
		$scope.miniTemplate = $scope.mini[$scope.randomMini];
		if(type == "final") {
			$scope.isMatch = false;
			$scope.isTest = false;
			if($scope.miniTemplate.includes("match")) $scope.isMatch = true;
			else if($scope.miniTemplate.includes("test")) $scope.isTest = true;
			if($scope.isMatch && $scope.inCourse) {
				$scope.getChoices($scope.cardsInCourse, type);
			} else if($scope.isTest) {
				$timeout(function() {$scope.getTest()}, 1000);
			}
		}
		
		if(type == "mini" && $scope.doneCards[$scope.randomIndex][0]) {
			$scope.vars.language = true;
			// check if mini includes trans templates, and if not, refillMinis
			$scope.checkTemplates("trans");
			// get miniTemplate that is trans
			while(!$scope.miniTemplate.includes("trans")) {
				$scope.randomMini = Math.floor(Math.random()*$scope.mini.length);
				$scope.miniTemplate = $scope.mini[$scope.randomMini];
			}
			$scope.miniTemplate = $scope.mini[$scope.randomMini];
		} else $scope.vars.language = false;
		
		$scope.getKeyboard();

		// if dictation
		if($scope.whichType() && $scope.miniTemplate.includes("dict") && !$scope.miniTemplate.includes("match")) {
			$scope.getAudio($scope.whichType());
			if($scope.currentRecording.src.includes("undefined")) {
				// if no audio, get new miniTemplate that does not contain dictation
				// check if mini includes dictation templates, and if not, refillMinis
				$scope.checkTemplates("dict", true);
				// get miniTemplate that is NOT dict
				while($scope.miniTemplate.includes("dict")) {
					$scope.randomMini = Math.floor(Math.random()*$scope.mini.length);
					$scope.miniTemplate = $scope.mini[$scope.randomMini];
				}
				$scope.miniTemplate = $scope.mini[$scope.randomMini];
			} else {
				// if has audio, autoplay audio
				$timeout(function(){ $scope.playAudio($scope.whichType()); }, 1000);
			}
		}
	}
	
	$scope.refillMinis = function(mode) {
		$scope.mini = ["views/profile/mini/dictation-mc.html",
			           "views/profile/mini/dictation-spell.html",
			           "views/profile/mini/dictation-trans-mc.html",
			            "views/profile/mini/dictation-trans-spell.html",
			            "views/profile/mini/translation-mc.html",
			            "views/profile/mini/translation-spell.html"];
		if(mode == "final") {
			$scope.mini = ["views/profile/mini/final/dictation-match.html",
							"views/profile/mini/final/translation-match.html"];
			// check if deck/course has Tests, if so, add other templates
			if($scope.tests.length != 0) {
				$scope.mini.push("views/profile/mini/final/test-template.html");
			}
		}
	}
	
	$scope.checkTemplates = function(type, doesNotContain) {
		var containsType = false;
		var doesNotContainType = false;
		for(var i = 0; i < $scope.mini.length; i++) {
			if($scope.mini[i].includes(type)) containsType = true;
			if(!$scope.mini[i].includes(type)) doesNotContainType = true;
		}
		if(!containsType && !doesNotContain) $scope.refillMinis();
		else if(doesNotContainType && doesNotContain) $scope.refillMinis();
	}
	
	$scope.getKeyboard = function() {
		if($scope.miniTemplate.lastIndexOf("spell") > -1) {
			if($scope.miniTemplate.lastIndexOf("trans") > -1) {
				if($scope.vars.language) {
					$scope.correctChoice = $scope.randomCard.frontphrase;
					if($scope.inCourse) $scope.setupKeyboard($scope.course.content.lang1);
					else if($scope.inDeck) $scope.setupKeyboard($scope.deck.content.lang1);
				} else {
					$scope.correctChoice = $scope.randomCard.backphrase;
					if($scope.inCourse) $scope.setupKeyboard($scope.course.content.lang2);
					else if($scope.inDeck) $scope.setupKeyboard($scope.deck.content.lang2);
				}
			} else {
				if($scope.vars.language) {
					$scope.correctChoice = $scope.randomCard.backphrase;
					if($scope.inCourse) $scope.setupKeyboard($scope.course.content.lang2);
					else if($scope.inDeck) $scope.setupKeyboard($scope.deck.content.lang2);
				} else {
					$scope.correctChoice = $scope.randomCard.frontphrase;
					if($scope.inCourse) $scope.setupKeyboard($scope.course.content.lang1);
					else if($scope.inDeck) $scope.setupKeyboard($scope.deck.content.lang1);
				}
			}
			$('.spell-form').val("");
		}
	}
	
	$scope.getChoices = function(cardsArray, type) {
		$scope.choices = [];
		$scope.isChoice = [];
		var i = 0;
		while(i < cardsArray.length) {
			$scope.isChoice.push(false);
			i++;
		}
		//if in test mode, using randomIndex, find real index in the current deck
		var realIndexInDeck = 0;
//		if(type == "final") {
//			var i = 0;
//			while($scope.randomIndex > $scope.lastIndexInDecks[i]) {
//				i++;
//			}
//			realIndexInDeck = cards.length-($scope.lastIndexInDecks[i]-$scope.randomIndex)-1;
//		} else if(type == "mini"){
			realIndexInDeck = $scope.randomIndex;
//		}
		// creating the 4 choices
		if(cardsArray.length >= 4) {
			for(var i = 0; i < 3; i++) {
				var randomChoiceIndex = Math.floor(Math.random()*cardsArray.length);
				// choosing which 3 cards are the other choices, each unique
				while($scope.isChoice[randomChoiceIndex] 
					|| cardsArray[randomChoiceIndex]._id == cardsArray[realIndexInDeck]._id) {
					randomChoiceIndex = Math.floor(Math.random()*cardsArray.length);
				}
				$scope.isChoice[randomChoiceIndex] = true;
				$scope.choices.push(cardsArray[randomChoiceIndex]);
			}
			$scope.choices.push(cardsArray[realIndexInDeck]);
			
		} else {
			angular.copy(cardsArray, $scope.choices);
		}
		$scope.randomCard = cardsArray[realIndexInDeck];
		if(type == "final") {
			$scope.frontChoices = [];
			angular.copy($scope.choices, $scope.frontChoices);
			$scope.backChoices = shuffleArray($scope.choices);
			// if dictation
			if($scope.miniTemplate.includes("dict")) {
				$scope.show($ionicLoading);
				var count = 0;
				for(var i = 0; i < $scope.frontChoices.length; i++) {
					cards.getCard($scope.frontChoices[i]._id).success(function(data) {
						var index = $scope.frontChoices.map(function(x) { return x._id }).indexOf(data.card._id);
						angular.copy(data.card, $scope.frontChoices[index]);
						count++;
						if(count == $scope.choices.length) $scope.hide($ionicLoading);
					})
				}
			}
		} else {
			$scope.choices = shuffleArray($scope.choices);
		}
	}
	
	$scope.getTest = function() {
//		var randomTestIndex = Math.floor(Math.random()*$scope.tests.length);
		cards.getTest($scope.tests[0]).success(function(data) {
			var htmlBody = data.test.content;
//			angular.copy(data.metacard.recordingFiles, $scope.metacardsArray[$scope.currentMetaIndex].recordingFiles);
			var parser = new DOMParser();
			var doc = parser.parseFromString(htmlBody, "text/html");
			$('.deck-test .test-body').empty();
			$('.deck-test .test-body').append(doc.firstChild);
			$compile($('.deck-test .test-body')[0])($scope);
		})
	}
	
	$scope.checkedAnswer = false;
	$scope.checkChoice = function(typeParam, choiceParam, isTyping) {
		var choice;
		if(!choiceParam) {
			choice = $('.spell-form').val();
		} else choice = choiceParam;
		
		var type;
		if(!typeParam) {
			// find out which type
			type = $scope.whichType();
		} else {
			type = typeParam;
		}
		
		// now check answer
		if(!$scope.checkedAnswer) {
			// typeParam exists if miniTemplate is not spell
			if(typeParam) {
				var type = typeParam;
				if(type == "front") {
					if(compareNoCase(choice, $scope.randomCard.backphrase, "front")) {
						$scope.markCorrect(choice);
						$scope.correctChoices++;
						$scope.isCorrect = true;
						$scope.showCorrectFront = true;
					} else if(!isTyping) {
						$scope.markCorrect($scope.randomCard.backphrase);
						$scope.markIncorrect(choice);
						$scope.isCorrect = false;
						$scope.showIncorrectFront = true;
					}
				} else if(type == "back") {
					if(compareNoCase(choice, $scope.randomCard.frontphrase, "back")) {
						$scope.markCorrect(choice);
						$scope.correctChoices++;
						$scope.isCorrect = true;
						$scope.showCorrectFront = true;
					} else if(!isTyping) {
						$scope.markCorrect($scope.randomCard.frontphrase);
						$scope.markIncorrect(choice);
						$scope.isCorrect = false;
						$scope.showIncorrectFront = true;
					}
				}
			} else {
				if(compareNoCase(choice, $scope.correctChoice, type)) {
					$scope.correctChoices++;
					$scope.isCorrect = true;
					$scope.showCorrectFront = true;
				} else if(!isTyping) {
					$scope.isCorrect = false;
					$scope.showIncorrectFront = true;
				}
			}
			if(!isTyping || $scope.isCorrect) {
				$scope.checkedAnswer = true;
				$('.mini-message-container').addClass("active");
				if($scope.isCorrect) {
					$timeout(function(){ $scope.next(); }, 2000);
					users.addExp(2);
				} else {
					users.addExp(1);
				}
			}
		}
	}
	
	// compare strings case-insensitively
	var compareNoCase = function(str, correctStr, side) {
		if(side == "front") {
			if($scope.miniTemplate.includes("trans") && $scope.randomCard.backlang == "English"
				|| !$scope.miniTemplate.includes("trans") && $scope.randomCard.frontlang == "English") {
				str = str.toUpperCase();
				correctStr = correctStr.toUpperCase();
			}
		} else if(side == "back") {
			if($scope.miniTemplate.includes("trans") && $scope.randomCard.frontlang == "English"
				|| !$scope.miniTemplate.includes("trans") && $scope.randomCard.backlang == "English") {
				str = str.toUpperCase();
				correctStr = correctStr.toUpperCase();
			}
		}
		return cleanUpSpaces(str) == cleanUpSpaces(correctStr);
	}
	
	// remove random spaces in front of and behind a phrase
	var cleanUpSpaces = function(str) {
		var i = 0;	// find index of the first character
		while (i < str.length && str.charAt(i) == ' ') {
			i++;
		}
		var j = str.length-1;	// find index of the last character
		while (j >= 0 && str.charAt(j) == ' ') {
			j--;
		}
		return str.slice(i, j+1);
	}
	
	$scope.whichType = function() {
		var type;
		if($scope.miniTemplate == "views/profile/mini/dictation-mc.html" && !$scope.vars.language) type = 'front';
		else if($scope.miniTemplate == "views/profile/mini/dictation-mc.html" && $scope.vars.language) type = 'back';
		else if($scope.miniTemplate == "views/profile/mini/dictation-spell.html" && !$scope.vars.language) type = 'front';
		else if($scope.miniTemplate == "views/profile/mini/dictation-spell.html" && $scope.vars.language) type = 'back';
		else if($scope.miniTemplate == "views/profile/mini/dictation-trans-mc.html" && !$scope.vars.language) type = 'front';
		else if($scope.miniTemplate == "views/profile/mini/dictation-trans-mc.html" && $scope.vars.language) type = 'back';
		else if($scope.miniTemplate == "views/profile/mini/dictation-trans-spell.html" && !$scope.vars.language) type = 'front';
		else if($scope.miniTemplate == "views/profile/mini/dictation-trans-spell.html" && $scope.vars.language) type = 'back';
		else if($scope.miniTemplate == "views/profile/mini/translation-spell.html" && !$scope.vars.language) type = 'front';
		else if($scope.miniTemplate == "views/profile/mini/translation-spell.html" && $scope.vars.language) type = 'back';
		return type;
	}
	
	$scope.markCorrect = function(text, isAudio) {
		$('.choice').filter(function() {
			if(isAudio) return $(this).find(".audio-answer").text() === text;
		    else return $(this).text() === text;
		}).addClass("correct");
		$('.choice').removeClass("selected");
	}
	
	$scope.markIncorrect = function(text, temporary, isAudio) {
		$('.choice').filter(function() {
			if(isAudio) return $(this).find(".audio-answer").text() === text;
		    else return $(this).text() === text;
		}).addClass("incorrect");
		$('.choice').removeClass("selected");
		if(temporary) {
			$timeout(function(){ 
				$('.choice').filter(function() {
					if(isAudio) return $(this).find(".audio-answer").text() === text;
				    else return $(this).text() === text;
				}).removeClass("incorrect");
			}, 1000);
		}
	}
	
	$scope.markSelected = function(text, isAudio) {
		$('.choice').filter(function() {
		    if(isAudio) return $(this).find(".audio-answer").text() === text;
		    else return $(this).text() === text;
		}).addClass("selected");
	}
	
	$scope.resetCorrect = function() {
		$('.choice').removeClass("correct");
		$('.choice').removeClass("incorrect");
	}
	//show correct
	$scope.next = function(mode) {
		$scope.showCorrectFront = false;
		$scope.showCorrectBack = false;
		$scope.showIncorrectFront = false;
		$scope.showIncorrectBack = false;
		$scope.showTestCorrect = false;
		$scope.checkedAnswer = false;
		$scope.setProgress($scope.miniProgress);
		$('.mini-message-container').removeClass("active");
		$scope.answer = "";
		$scope.resetCorrect();
		if(!mode) mode = "mini";
		$scope.getMini(mode);
		
		// clear all choices marked active
	}
	
	$scope.getMini = function(mode) {
		if(mode == "mini") {
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
		} else {
			if($scope.isTest) {
				$scope.tests.splice(0, 1);
			} else {
				for(var i = 0; i < $scope.choices.length; i++) {
					var index = $scope.cardsInCourse.map(function(x) { return x._id }).indexOf($scope.choices[i]._id);
					//find index of choices in cardsInCourse
					$scope.doneCards[index] = true;
					$scope.count++;
				}
			}
		}
		
		$scope.isCorrect = false;
		if(mode == "mini") {
			$scope.miniProgress = Math.floor($scope.count/($scope.doneCards.length*2)*100);
		} else if(mode == "final") {
			$scope.miniProgress = Math.floor($scope.count/($scope.doneCards.length)*100); // + number of tests in course
		}
		$scope.setMiniProgress($scope.miniProgress);
		
		$scope.mini.splice($scope.randomMini, 1); //splice element from array
		if($scope.mini.length == 0) {
			$scope.refillMinis();
		}
		$scope.checkDoneAndContinue(mode);
	}
	
	$scope.checkDoneAndContinue = function(mode) {
		if(!$scope.isDone(mode)) {
			$scope.getRandomIndex(mode);
		} else {
			if($scope.learnMode[1]) {
				if($scope.currentIndex == $scope.deck.content.cards.length) {
					$scope.currentIndex++;
					$scope.deckIndex++;
				}
				$scope.setLearnMode(false);
			} else if($scope.reviewMode[0]) {
				$scope.setReviewMode(false);
			} else if($scope.testMode[0]) {
				$scope.setTestMode(false);
			}
			$scope.goBackToDeckCourse();
		}
	}
	
	$scope.isDone = function(mode) {
		for(var i = 0; i < $scope.doneCards.length; i++) {
			if(mode == "mini" && !$scope.doneCards[i][0] || !$scope.doneCards[i][1]) {
				return false;
			} else if(mode == "final" && !$scope.doneCards[i]) {
				return false;
			}
		}
		return true;
	}
	
	$scope.currentRecording = new Audio();
	$scope.playAudio = function(type, choice) {
		$scope.getAudio(type, choice);
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
	
	$scope.getAudio = function(type, choice) {
		if(type == "front") {
			if(!choice) $scope.currentRecording.src = $scope.randomCard.recordingFiles[0];
			else $scope.currentRecording.src = choice.recordingFiles[0];
		} else if(type == "back") {
			if(!choice) $scope.currentRecording.src = $scope.randomCard.recordingFiles[2];
			else $scope.currentRecording.src = choice.recordingFiles[2];
		}
	}
	
	$scope.playMetaCardAudio = function(order) {
		$scope.currentRecording.src = $scope.metacardsArray[$scope.currentMetaIndex].recordingFiles[order];
		
		$scope.currentRecording.addEventListener('loadedmetadata', function() {
		    console.log("Playing " + $scope.currentRecording.src + ", for: " + $scope.currentRecording.duration + "seconds.");
		    $scope.currentRecording.play(); 
		});
		$scope.currentRecording.addEventListener("ended", function(){
		     $scope.currentRecording.currentTime = $scope.currentRecording.duration;
		     console.log("ended");
		});
	}
	
	// REVIEW
	
	$scope.initializeReview = function(type) {
		$scope.initializeMini("mini");
		
		$scope.doneCards = [];
		if(type == "deck") {
			for(var i = 0; i < $scope.deck.progress.cardIndex; i++) {
				$scope.doneCards.push([false, false]);
			}
			$scope.startMini("mini");
		} else if(type == "course") {
			$scope.show($ionicLoading);
			$scope.cardsInCourse = [];
			var realCount = 0;
			var count = 0;
			var maxDecksCount = $scope.deckIndex+1;
			if ($scope.deckIndex > $scope.course.content.decks.length) {
				maxDecksCount = $scope.course.content.decks.length;
			}
			for(var i = 0; i < maxDecksCount; i++) {
				// get the progress for each deck
				var maxCardsCount = $scope.course.content.decks[i].progress.cardIndex;
				if ($scope.course.content.decks[i].progress.cardIndex > $scope.course.content.decks[i].content.cards.length) {
					maxCardsCount = $scope.course.content.decks[i].content.cards.length;
				}
				for(var j = 0; j < maxCardsCount; j++) {
					$scope.doneCards.push([false, false]);
					$scope.cardsInCourse.push($scope.course.content.decks[i].content.cards[j]);
					realCount++;
					cards.getCard($scope.course.content.decks[i].content.cards[j]._id).success(function(data) {
						var index = $scope.cardsInCourse.map(function(x) { if(x) return x._id }).indexOf(data.card._id);
						angular.copy(data.card, $scope.cardsInCourse[index]);
						count++;
						if(count == realCount) {
							$scope.startMini("mini");
							$scope.hide($ionicLoading);
						}
					})
				}
			}
		}
	}
	//show complete
	$scope.continueReview = function() {
		if($scope.inDeck) {
			if($scope.learnMode[2]) {
				//go to the next deck in the course if in a course
				if($scope.inCourse) {
					if($scope.course) {
						$scope.goBackToDeckCourse();
						$scope.learnCourse();
					}
				} else {
					$scope.goBackToDeckCourse(true);
				}
			} else if($scope.reviewMode[1]) {
//				if($scope.inCourse) {
//					$scope.goBackToDeckCourse();
//					$scope.testDeck();
//				} else {
					$scope.goBackToDeckCourse(true);
//				}
			} else if($scope.testMode[1]) {
				$scope.goBackToDeckCourse(true);
			}
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
		var width = $scope.miniProgress;
		if(elem) {
			elem.css('width', width + "%"); 
			if(width) document.getElementById("label").innerHTML = width * 1 + '%';
		}
	}
	
	$scope.restartReview = function() {
		var confirmPopup = $ionicPopup.confirm({
			title: 'Restart Review',
			template: 'Are you sure you want to start over? All your progress will be erased.'
		});

		confirmPopup.then(function(res) {
			if(res) {
				$scope.goBackToDeckCourse();
				$scope.initializeReview();
			}
		});
	}
	
	// TEST

	$scope.initializeTest = function() {
		$scope.initializeMini("final");
		
		$scope.doneCards = [];
//		$scope.lastIndexInDecks = [];
//		for(var i = 0; i < $scope.course.content.decks.length; i++) {
//			if(i != 0) {
//				$scope.lastIndexInDecks.push($scope.course.content.decks[i-1].content.cards.length-1 + $scope.course.content.decks[i].content.cards.length);
//			} else if($scope.course.content.decks[i].content.cards.length != 0){
//				$scope.lastIndexInDecks.push($scope.course.content.decks[i].content.cards.length-1);
//			}
//			for(var j = 0; j < $scope.course.content.decks[i].content.cards.length; j++) {
//				$scope.doneCards.push([false, false]);
//			}
//		}
		$scope.cardsInCourse = [];
		var realCount = 0;
		var count = 0;
		$scope.show($ionicLoading);
		for(var i = 0; i < $scope.course.content.decks.length; i++) {
			// get the progress for each deck
			for(var j = 0; j < $scope.course.content.decks[i].content.cards.length; j++) {
				$scope.doneCards.push(false);
				$scope.cardsInCourse.push($scope.course.content.decks[i].content.cards[j]);
//				realCount++;
//				cards.getCard($scope.course.content.decks[i].content.cards[j]._id).success(function(data) {
//					var index = $scope.cardsInCourse.map(function(x) { return x._id }).indexOf(data.card._id);
//					angular.copy(data.card, $scope.cardsInCourse[index]);
//					count++;
//					if(count == realCount) {
//						$scope.startMini("final");
//						$scope.hide($ionicLoading);
//					}
//				})
			}
		}
		$scope.tests = [];
		angular.copy($scope.course.content.tests, $scope.tests);
		$scope.startMini("final");
		$scope.hide($ionicLoading);
	}
	
	/* SUBMIT TEST */
	
	$scope.checkTest = function() {
		if($scope.checkedAnswer) return;
		$scope.numTotal = $('.test-body ol li.test-question').length;
		for(var i = 0; i < $scope.numTotal; i++) {
			if($($('.test-body ol li.test-question')[i]).hasClass('multiple-choice')) {
				var selectedAnswer = $('.test-body ol li.test-question input[name="' + (i+1) + '"]:checked').val();
			} else if($($('.test-body ol li.test-question')[i]).hasClass('short-answer')) {
				var selectedAnswer = $('.test-body ol li.test-question input[type=text]').val()
			} else if($($('.test-body ol li.test-question')[i]).hasClass('essay')) {
				var selectedAnswer;
			} else if($($('.test-body ol li.test-question')[i]).hasClass('speech')) {
				
			}
			if(selectedAnswer == $($('.test-body ol li.test-question')[i]).find('b.answer').html()) {
				$('.test-body ol li.test-question#' + (i+1) + '').addClass("correct");
			} else {
				$('.test-body ol li.test-question#' + (i+1) + '').addClass("incorrect");
			}
		}
		//count how many correct questions
		$scope.numCorrect = $('.test-body ol li.test-question.correct').length;
		if(!$scope.checkedAnswer) {
			$scope.checkedAnswer = true;
			$scope.showTestCorrect = true;
			users.addExp(4);
			$('.mini-message-container').addClass("active");
		}
	}
	
	/* MATCH GAME */
	
	// side is the side that the function checks, not the one that is calling
	
	$scope.checkMatch = function(checkedSide, selectedSide, choice, isAudio) {
		if($scope.isSameMatch(selectedSide, choice, isAudio)) return;
		if($scope.otherMatch().length > 0) {
			if($scope.checkIfMatch(checkedSide, choice, isAudio)) {
				//make choices green and unclickable
				if($scope.miniTemplate.includes("dictation")) $scope.markCorrect(choice.frontphrase, true);
				$scope.markCorrect(choice.frontphrase, isAudio);
				$scope.markCorrect(choice.backphrase, isAudio);
				$scope.isCorrect = true;
			} else {
				//make choices red for 1 sec and then back to normal
				$scope.markIncorrect($scope.otherMatch().html(), true, isAudio);
				if(selectedSide == "front") $scope.markIncorrect(choice.frontphrase, true, isAudio);
				else if(selectedSide == "back") $scope.markIncorrect(choice.backphrase, true, isAudio);
			}
		} else {
			//make choice selected gray
			if(selectedSide == "front") $scope.markSelected(choice.frontphrase, isAudio);
			else if(selectedSide == "back") $scope.markSelected(choice.backphrase, isAudio);
		}
		if($scope.isCorrect && $scope.allMatched()) {
			$scope.checkedAnswer = true;
			$scope.showTestCorrect = true;
			users.addExp(4);
			$('.mini-message-container').addClass("active");
		}
	}
	
	$scope.checkIfMatch = function(side, choice, isAudio) {
		var isCheckedAudio = true;
		if(isAudio || $scope.miniTemplate.includes("translation")) isCheckedAudio = false;
		return side == "back" && ($scope.findMatch(choice.backphrase, isCheckedAudio).hasClass("selected"))
			|| side == "front" && ($scope.findMatch(choice.frontphrase, isCheckedAudio).hasClass("selected"));
	}
	
	$scope.allMatched = function() {
		return $('.choice.correct').length == $scope.choices.length*4;
	}
	
	$scope.isSameMatch = function(side, choice, isAudio) {
		if(side == "front") {
			return $scope.findMatch(choice.frontphrase, isAudio).hasClass("selected") || $scope.findMatch(choice.frontphrase, isAudio).hasClass("correct");
		} else if(side == "back") {
			return $scope.findMatch(choice.backphrase, isAudio).hasClass("selected") || $scope.findMatch(choice.backphrase, isAudio).hasClass("correct");
		}
	}
	
	$scope.findMatch = function(text, isAudio) {
		return $('.choice').filter(function() {
			if(isAudio) return $(this).find(".audio-answer").text() === text;
		    else return $(this).text() === text;
		})
	}
	
	$scope.otherMatch = function() {
		return $('.choice.selected');
	}
	
	/* END MATCH GAME */
	
	$scope.restartTest = function() {
		var confirmPopup = $ionicPopup.confirm({
			title: 'Restart Test',
			template: 'Are you sure you want to start over? All your progress will be erased.'
		});

		confirmPopup.then(function(res) {
			if(res) {
				$scope.goBackToDeckCourse();
				$scope.initializeTest();
			}
		});
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
				course: $scope.course.content,
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

	var deleteArrayDuplicates = function(array) {
		var array;
		var uniqueArray = [];
		$.each(array, function(i, el){
		    if($.inArray(el, uniqueArray) === -1) uniqueArray.push(el);
		});
		return uniqueArray;
	}
	
	// KEYBOARD

	$scope.setupKeyboard = function(language) {
		if ($scope.reviewSettings.showTyping) {
			if(language == "English") $scope.setupKeyboardEnglish();
			else $scope.setupKeyboardSpelling(language);
		} else if ($scope.reviewSettings.showSpelling){
			$scope.setupKeyboardSpelling(language);
		}
		
		/* space */
		$scope.space = function() {
			$(".spell-form").val($(".spell-form").val() + " ");
//			thisElement.find(".popout").css("display", "block");
//			thisElement.find(".popout .head").html(thisElement.find("span").html().substring(0,1));
//			thisElement.find("span").css("color", "transparent");
		}
		/* backspace */
		$scope.backspace = function(){
			$(".spell-form").val($(".spell-form").val().substring(0, $(".spell-form").val().length-1));//$(".spell-form").html($(".spell-form").html().substring(0,$(".spell-form").html().length-1));
		};
		/* type */
		$scope.type = function(thisElement) {
			$(".spell-form").val($(".spell-form").val() + thisElement.find("span").html());//$(".spell-form").append($(this).find("span").html().substring(0,1));
			if ($scope.isShift) $scope.upperToLowercase();
		}

		/* case change */
		$scope.lowerToUppercase = function() {
			if ($scope.isShift == false) {
				$("#lowercase").css("display", "none");
				$("#uppercase").css("display", "block");
				$scope.isShift = true;
			}
		}
		$scope.upperToLowercase = function() {
			if ($scope.isShift == true) {
				$("#lowercase").css("display", "block");
				$("#uppercase").css("display", "none");
				$scope.isShift = false;
			}
		}
		/* caps lock */
		$scope.capsLockOn = function(thisElement) {
			if ($scope.capsLock == false) {
				$("#lowercase").css("display", "none");
				$("#uppercase").css("display", "block");
				thisElement.children("span").html("&#8682;");
				$scope.capsLock = true;
			}
		}
		$scope.capsLockOff = function(thisElement) {
			if ($scope.capsLock == true) {
				$("#lowercase").css("display", "block");
				$("#uppercase").css("display", "none");
				thisElement.children("span").html("&#11014;");
				$scope.capsLock = false;
			}
		}
		
		$scope.syncKeyboard(language);
	}
	
	$scope.setupKeyboardSpelling = function(language) {
		$scope.keyboardTemplate = "views/profile/mini/keyboards/keyboard-any-type.html";
		
		$scope.characters = [];
		if (language == "Chinese" || language == "Japanese" || language == "Korean" || language == "Hindi") {
			for(var i = 0; i < $scope.choices.length; i++) {
				if($scope.deck && $scope.deck.content && language == $scope.deck.content.lang1 || $scope.course && $scope.course.content && language == $scope.course.content.lang1) {
					for(var j = 0; j < $scope.choices[i].frontphrase.length; j++) {
						$scope.characters.push($scope.choices[i].frontphrase.charAt(j));
					}
				} else if($scope.deck && $scope.deck.content && language == $scope.deck.content.lang2 || $scope.course && $scope.course.content && language == $scope.course.content.lang2) {
					for(var j = 0; j < $scope.choices[i].backphrase.length; j++) {
						$scope.characters.push($scope.choices[i].backphrase.charAt(j));
					}
				}
			}
		} else {
			for(var i = 0; i < $scope.choices.length; i++) {
				if($scope.deck && $scope.deck.content && language == $scope.deck.content.lang1 || $scope.course && $scope.course.content && language == $scope.course.content.lang1) {
					var phrase = $scope.choices[i].frontphrase;
				} else if($scope.deck && $scope.deck.content && language == $scope.deck.content.lang2 || $scope.course && $scope.course.content && language == $scope.course.content.lang2) {
					var phrase = $scope.choices[i].backphrase;
				}
				var j = 0;
				while (j < phrase.length) {
					if (phrase.charAt(j) == " " || j == phrase.length-1) {
						$scope.characters.push(phrase.substr(0, j+1));
						phrase = phrase.slice(j+1);
						j = -1;
					}
					j++;
				}
			}
		}
		
		$scope.characters = shuffleArray($scope.characters);
		$scope.characters = deleteArrayDuplicates($scope.characters);
		
		$timeout(function(){ 
			$(".keyboard.any .row .white:not(:last):not(.space)").mousedown(function(){
				$scope.type($(this));
			});
			$(".keyboard.any .row .key.space").mousedown(function() {
				$scope.space();
			})
			$(".keyboard.any .row .key.backspace").mousedown(function() {
				$scope.backspace();
			})
			$(".choices .btn.enter").mousedown(function() {
				$scope.checkChoice();
			})
//			$(".white").mouseup(function(){
//				$scope.typeUp($(this));
//			});
		 }, 1500);
	}
	
	$scope.setupKeyboardChinese = function() {
		$scope.keyboardTemplate = "views/profile/mini/keyboards/keyboard-chinese-hand.html";
	}
	
	$scope.setupKeyboardEnglish = function () {
		$scope.keyboardTemplate = "views/profile/mini/keyboards/keyboard-english-type.html";
		
		$scope.isShift = false,
		$scope.capsLock = false,
		isNumSymbols = false,
		isMoreSymbols = false;

		var kbdMode = ["lowercase", "uppercase", "numbers", "symbols"];

		$timeout(function(){
			/* typing */
			for (var i = 0; i < kbdMode.length; ++i) {
				$("#" + kbdMode[i] + " .row .white:not(:last)").mousedown(function(){
					$scope.type($(this));
				});
//				$("#" + kbdMode[i] + " .row .white:last").mousedown(function(){
//					$(".spell-form").val($(".spell-form").val() + " ");//$(".spell-form").append("&#32;");
//				});
			}
			$(".keyboard.english .row .key.space").mousedown(function() {
				$scope.space();
			})
			$(".keyboard.english .row .key.backspace").mousedown(function() {
				$scope.backspace();
			})
			$(".choices .btn.enter").mousedown(function() {
				$scope.checkChoice();
			})
			
//			$(".white").mouseup(function(){
//				$scope.typeUp($(this));
//				if ($scope.isShift == true && $scope.capsLock == false) {
//					$("#lowercase").css("display", "block");
//					$("#uppercase").css("display", "none");
//					$scope.isShift = false;
//				}
//			});
	
			/* toggle shift */
			//lowercase to uppercase
			$(".keyboard.english #lowercase .row .key.shift").click(function(){
				$scope.lowerToUppercase();
			});
			//uppercase to lowercase
			$(".keyboard.english #uppercase .row .key.shift").click(function(){
				$scope.upperToLowercase();
			});
			//caps lock on
			$(".keyboard.english #lowercase .row .key.caps").click(function(){
				$scope.capsLockOn($(this));
			});
			//caps lock off
			$(".keyboard.english #uppercase .row .key.caps").click(function(){
				$scope.capsLockOff($(this));
			});
			
//			for (var j = 0; j < kbdMode.length; ++j) {
//				$("#" + kbdMode[j] + " .row:eq(2) .key:last").click($scope.backspace);
//			};
	
//			/* toggle numbers */
//			//lowercase/uppercase to numbers
//			for (var k = 0; k < kbdMode.length-2; ++k) {
//				$("#" + kbdMode[k] + " .row:eq(3) .gray:eq(0)").click(function(){
//					if (isNumSymbols == false) {
//						$("#numbers").css("display", "inherit");
//						$("#lowercase").css("display", "none");
//						$("#uppercase").css("display", "none");
//						$("#uppercase .row:eq(2) .gray:eq(0)").children("span").html("&#11014;");
//						isNumSymbols = true;
//						$scope.isShift = false;
//						$scope.capsLock = false;
//					}
//				});
//			}
//			//numbers to lowercase
//			$("#numbers .row:eq(3) .gray:eq(0)").click(function(){
//				if (isNumSymbols == true) {
//					$("#numbers").css("display", "none");
//					$("#lowercase").css("display", "block");
//					isNumSymbols = false;
//				}
//			});
//	
//			/* toggle symbols */
//			//numbers to symbols
//			$("#numbers .row:eq(2) .gray:eq(0)").click(function(){
//				if (isMoreSymbols == false) {
//					$("#numbers").css("display", "none");
//					$("#symbols").css("display", "block");
//					isMoreSymbols = true;
//				}
//			});
//			//symbols to numbers
//			$("#symbols .row:eq(2) .gray:eq(0)").click(function(){
//				if (isMoreSymbols == true) {
//					$("#numbers").css("display", "block");
//					$("#symbols").css("display", "none");
//					isMoreSymbols = false;
//				}
//			});
//			//symbols to lowercase
//			$("#symbols .row:eq(3) .gray:eq(0)").click(function(){
//				if (isMoreSymbols == true) {
//					$("#lowercase").css("display", "block");
//					$("#symbols").css("display", "none");
//					isMoreSymbols = false;
//				}
//			});
//	
//			/* return (line break) */
//			for (var l = 0; l < kbdMode.length; ++l) {
//				$("#" + kbdMode[l] + " .row:eq(3) .gray:eq(1)").click(function(){
//					$(".spell-form").val($(".spell-form").val() + "\n"); //$(".spell-form").append("&#10;");
//				});
//			}
		}, 1500);
	};
	
	/* SETUP KEYBOARD SYNC */
	
	$scope.syncKeyboard = function(language) {
		$('body').on('keypress', function(e) {
			// user has pressed space
			if(e.keyCode == 32){
				$('.key.space').click();
				// user has pressed backspace
			} else if(e.keyCode == 8) {
				$('.key.backspace').click();
				// user has pressed enter
			} else if(e.keyCode == 13) {
				$('.key.enter').click();
			}
		});

		if(language == "English") {
			$('body').on('keypress keyup', function(e) {
				// user has pressed a key
				if(e.type == "keypress") {
					if(e.keyCode >= 65 && e.keyCode <= 90) {
						if($scope.isShift) {
							$('.key#' +  + String.fromCharCode(e.keyCode)).click();
						} else {
							$('.key#' +  + String.fromCharCode(e.keyCode).toLowercase()).click();
						}
					// user has pressed caps lock
					} else if(e.keyCode == 20) {
						$('.key.caps').mousedown();
					}
				// user has released a key
				} else {
					if(e.keyCode == 20) {
						$('.key.caps').mouseup();
					}
				}
					
			});
		} else if(language == "Chinese") {
			
		}
	}
}])