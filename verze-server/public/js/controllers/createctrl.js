angular.module('App').controller('CreateCtrl', [
'$rootScope',
'$scope',
'$compile',
'$state',
'$ionicHistory',
'$ionicActionSheet',
'$timeout',
'$ionicModal',
'$ionicPopup',
'$ionicPopover',
'$cordovaFile',
'$ionicLoading',
'FileService',
'ImageService',
'TimeFormat',
'Misc',
'Language',
'LanguageFormat',
'auth',
'cards',
'ContentCheck',
'BadFilter',
function($rootScope, $scope, $compile, $state, $ionicHistory, $ionicActionSheet, $timeout, $ionicModal, $ionicPopup, $ionicPopover, $cordovaFile, $ionicLoading, FileService, ImageService, TimeFormat, Misc, Language, LanguageFormat, auth, cards, ContentCheck, BadFilter) {
	
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
	
	$scope.template = 'views/create/create-form/create-form-info.html';
	
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
	$scope.isDeckValid = function(deck) {
		return ContentCheck.isDeckValid(deck);
	}
	$scope.isCourseValid = function(course) {
		return ContentCheck.isCourseValid(course);
	}
	$scope.isTestValid = function(test) {
		return ContentCheck.isTestValid(test);
	}
	$scope.isCardFiltered = function(card) {
		return ContentCheck.isCardFiltered(card);
	}
	$scope.isDeckFiltered = function(deck) {
		return ContentCheck.isDeckFiltered(deck);
	}
	$scope.isCourseFiltered = function(course) {
		return ContentCheck.isCourseFiltered(course);
	}
	$scope.isTestFiltered = function(test) {
		return ContentCheck.isTestFiltered(test);
	}
	
	// SCOPE VARIABLES
	$scope.editMode = true;
	$scope.searchMode = false;
	$scope.decks = cards.decks;
	$scope.courses = cards.courses;
	$scope.deck = {};
	$scope.course = {};
	$scope.card = {};
	
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
		if($ionicHistory.currentStateName().substr(0, 13) == 'createCard') $timeout(updateLanguage("card"), 1000);
		else if($ionicHistory.currentStateName().substr(0, 13) == 'createDeck') $timeout(updateLanguage("deck"), 1000);
		else if($ionicHistory.currentStateName().substr(0, 13) == 'createCourse') $timeout(updateLanguage("course"), 1000);
	});
	
	var updateLanguage = function(type) {
		if(type == "card") {
			$('.information-trans').text($scope.language.information);
			$('.deck-trans').text($scope.language.deck);
			$('.front-trans').text($scope.language.front);
			$('.back-trans').text($scope.language.back);
			$('.categories-trans').text($scope.language.categories);
			$('.tags-trans').text($scope.language.tags);
		} else if(type == "deck") {
			$('.create-deck-trans').text($scope.language.createDeck);
			$('.name-of-deck-trans').text($scope.language.nameOfDeck);
			$('.course-trans').text($scope.language.course);
			$('.language-1-trans').text($scope.language.language1);
			$('.language-2-trans').text($scope.language.language2);
			$('.categories-trans').text($scope.language.categories);
			$('.image-trans').text($scope.language.image);
		} else if(type == "course") {
			$('.create-course-trans').text($scope.language.createCourse);
			$('.name-of-course-trans').text($scope.language.nameOfCourse);
			$('.caption-trans').text($scope.language.caption);
			$('.language-1-trans').text($scope.language.language1);
			$('.language-2-trans').text($scope.language.language2);
			$('.difficulty-trans').text($scope.language.difficulty);
			$('.categories-trans').text($scope.language.categories);
			$('.image-trans').text($scope.language.image);
		}
	}
	
	/* COPY AND PASTE ABOVE INTO EACH CTRL */
	
	// CARD PARTS
	
	$scope.showCardParts = { showPronun: true, showExample: true, showMagic: false, showComments: false, showHover: false };

	$scope.hoverCard = function(hover) {
		if(hover) $scope.showCardParts.showHover = true;
		else $scope.showCardParts.showHover = false;
	}
	
	$('body').keyup(function(e){
		if(e.keyCode == 32){
			// user has pressed space
			if($('card').hasClass('flip')) $('card').removeClass('flip');
			else $('card').addClass('flip');
			return false;
		}
	});
	
	$scope.initializeDefaultCard = function() {
		$scope.defaultCard = {
				author: $scope.currentUser,
				frontlang: "Spanish",
				frontphrase: "¡Bienvenido!",
				frontpronun: "BEE-EN-VIN-'EE-DOE",
				frontexample: "¡Bienvenido a México!",
				backlang: "English",
				backphrase: "Welcome!",
				backpronun: "'WEL-KUHM",
				backexample: "Welcome to Mexico!",
				recordings: [],
				recordingFiles: [],
				notes: "Something we like to say to those who visit Mexico :)",
				image: "images/mexico-city-gif.gif",
				categories: [],
				tags: [],
				deck: "",
				fontstyle: "Arial",
				fontsize: 32
		};
		angular.copy($scope.defaultCard, $scope.card);
	}
	
	$scope.getUser = function() {
		$scope.show($ionicLoading);

		$scope.initializeDefaultCard();
		if(auth.getUserAll() == "false") {
			cards.getAll([true, true, true], $scope.currentUser.username).success(function(data) {
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
	
	// get the course in which the decks are in
	$scope.getCourseOfDeck = function(deck) {
		if(deck.content.course) {
			cards.getCourse(deck.content.course).success(function(data) {
				return data.name;
			})
		} else return "";
	}
	
	$ionicPopover.fromTemplateUrl('views/create/create-in-deck-course.html', {
		scope: $scope
	}).then(function(popover) {
		$scope.popover = popover;
	});

	$scope.openAddDeckPopover = function($event) {
		$scope.showAddDeckInfo = true; $scope.showAddCourseInfo = false;
		$scope.popover.show($event);
	};
	$scope.openAddCoursePopover = function($event) {
		$scope.showAddCourseInfo = true; $scope.showAddDeckInfo = false;
		$scope.popover.show($event);
	}
	$scope.closeAddDeckCoursePopover = function() {
		$scope.popover.hide();
	};
	
	$scope.changeTemplate = function(type) {
		$('.btn-edit.active').removeClass("active");
		if(type == 'info') {
			$scope.template='views/create/create-form/create-form-info.html';
			$('.btn-edit-info').addClass("active");
		} else if(type == 'text') {
			$scope.template='views/create/create-form/create-form-text.html';
			$('.btn-edit-text').addClass("active");
		} else if(type == 'style') {
			$scope.template='views/create/create-form/create-form-style.html';
			$('.btn-edit-style').addClass("active");
		} else if(type == 'media') {
			$scope.template='views/create/create-form/create-form-media.html';
			$('.btn-edit-media').addClass("active");
			setTimeout(function(){ setColorPicker(); }, 1000);
		} else if(type == 'audio') {
			$scope.template='views/create/create-form/create-form-audio.html';
			$('.btn-edit-audio').addClass("active");
		} else if(type == 'extra') {
			$scope.template='views/create/create-form/create-form-extra.html';
			$('.btn-edit-extra').addClass("active");
		}
	}

	// FONT SIZE
	
	$scope.decrSize = function() {
		$scope.card.fontsize--;
	}
	$scope.incrSize = function() {
		$scope.card.fontsize++;
	}
	
	// CARD TAGS

	$(document).keypress(function(e) {
	    if((e.which == 13 || e.which == 188)) {
	    	$scope.card.tags = $('#tags').tagsinput("items").itemsArray;
	    	if(!$scope.card.tags || !$scope.card.tags[0]) $scope.card.tags = $('#tags').tagsinput("items");
	    }
	});

	$scope.$watchGroup(['card.image', 'card.fontstyle', 'card.font-size', 'card.tags', 'card.deck'], function(newValues, oldValues) {
		$('.card-body').css({
			'background-image': 'linear-gradient(rgba(0, 0, 0, 0.25), rgba(0, 0, 0, 0.25)), url('+$scope.card.image+')'
		});
		$('.card-title, .card-subtitle, .card-example, .card-notes').css({
			'font-family': $scope.card.fontstyle
		});
		$('.card-title').css({
			'font-size': $scope.card.fontsize
		});

		changeSelectDeck();
	});

	// AUTO COMPLETE CARD AND DECK
	
	$('#deck-course').change(function() {
		$scope.selectedCourse = JSON.parse($('#deck-course option:selected').val());
		if($scope.selectedCourse != null) {
			$scope.deck.course = $scope.selectedCourse;
			$scope.deck.lang1 = $scope.deck.course.lang1;
			$scope.deck.lang2 = $scope.deck.course.lang2;
			$scope.deck.categories = $scope.deck.course.categories;
		}
	})
	
	var changeSelectDeck = function() {
		if($('#card-deck option:selected').length != 0) {
			$scope.selectedDeck = JSON.parse($('#card-deck option:selected').val())
			if($scope.selectedDeck != null) {
				$scope.card.deck = $scope.selectedDeck;
				$scope.card.frontlang = $scope.card.deck.lang1;
				$scope.card.backlang = $scope.card.deck.lang2;
				$scope.card.categories = $scope.card.deck.categories;
			}
		}
	}
	
	// TEXT EDIT POPOVER 
	
	$ionicPopover.fromTemplateUrl('views/create/create-form/text-edit-form/text-edit-popover.html', {
		scope: $scope
	}).then(function(popover) {
		$scope.textEditPopover = popover;
	});
	$scope.openTextEditPopover = function($event) {
		$scope.textEditPopover.show($event);
	}
	$scope.closeTextEditPopover = function() {
		$scope.textEditPopover.hide();
	};
	
	$(document).ready(function() { 
		$('.card-input').focus(function($event) {
			$scope.showEditCardText = { showFont: false, showSize: false, showAudio: true };
			$('.text-edit-popover').css("display", "block");
		})
		$('.card-input').click(function(e) {
			var x = e.pageX;
			var y = e.pageY;
			$('.text-edit-popover').css("top", y-40 + "px");
			$('.text-edit-popover').css("left", x + "px");
		});
		$('.edit-container').click(function(e) {
			$('.text-edit-popover').css("display", "none");
		})
		$('front-body .card-input.card-title').focus(function($event) {
			$scope.whichCardRecording = 0;
		})
		$('front-body .card-input.card-example').focus(function($event) {
			$scope.whichCardRecording = 1;
		})
		$('back-body .card-input.card-title').focus(function($event) {
			$scope.whichCardRecording = 2;
		})
		$('back-body .card-input.card-example').focus(function($event) {
			$scope.whichCardRecording = 3;
		})
		$('.card-input.card-subtitle').focus(function($event) {
			$scope.showEditCardText.showAudio = false;
		})
	})
	
	$scope.editCardText = function(type) {
		if(type == "font") {
			$scope.showEditCardText.showFont = !$scope.showEditCardText.showFont;
			$scope.showEditCardText.showSize = false;
			$('.text-edit-popover').css("width", "240px !important");
		} else if(type == "size") {
			$scope.showEditCardText.showSize = !$scope.showEditCardText.showSize;
			$scope.showEditCardText.showFont = false;
			$('.text-edit-popover').css("width", "180px !important");
		} else if(type == "audio") {
			$scope.playRecording($scope.whichCardRecording);
		}
	}
	
	// CREATE CARD, DECK, COURSE
	
	$scope.addCard = function(fromDeck) {
		$scope.show($ionicLoading);
		if(!$scope.isCardValid($scope.card)) {
			var alertPopup = $ionicPopup.alert({
				title: 'Uh Oh!',
				template: 'Please fill out missing fields on your card before creating it.'
			});
			$scope.hide($ionicLoading);
			return ;
		} else if(!$scope.isCardFiltered($scope.card)) {
			var alertPopup = $ionicPopup.alert({
				title: 'Uh Oh!',
				template: 'Please do not create objectionable content.'
			});
			$scope.hide($ionicLoading);
			return ;
		}
		if(!fromDeck && $scope.f) $scope.card.image = $scope.f;
		else if(!fromDeck) {
			$scope.card.image = new File([$scope.blob], $scope.color.name);
		}
		cards.createCard($scope.card, fromDeck).success(function() {
			var alertPopup = $ionicPopup.alert({
				title: 'Card Published',
				template: 'Your card has been successfully published.'
			});
//			angular.copy($scope.defaultCard, $scope.card);
//			$ionicHistory.goBack(-1);
		}).error(function(err) {
			var alertPopup = $ionicPopup.alert({
				title: 'Uh Oh!',
				template: 'Something went wrong when publishing your card.'
			});
		}).finally(function($ionicLoading) {
			$scope.hide($ionicLoading);
		});
	};
	
	$scope.addDeck = function() {
		$scope.show($ionicLoading);
		if(!$scope.isDeckValid($scope.deck)) {
			$scope.hide($ionicLoading);
			var alertPopup = $ionicPopup.alert({
				title: 'Uh Oh!',
				template: 'Please fill out missing fields on your deck before creating it.'
			});
			return;
		} else if(!$scope.isDeckFiltered($scope.deck)) {
			var alertPopup = $ionicPopup.alert({
				title: 'Uh Oh!',
				template: 'Please do not create objectionable content.'
			});
			$scope.hide($ionicLoading);
			return ;
		}
		if($scope.f) $scope.deck.image = $scope.f;
		cards.createDeck($scope.deck).success(function(data) {
			$scope.deck = data;
			$scope.addCardsToDeck();
			var alertPopup = $ionicPopup.alert({
				title: 'Deck Created',
				template: 'Your deck has been successfully created.'
			});
			$scope.deck = {};
			$('.color-btn i.active').removeClass("active");
			$ionicHistory.goBack(-1);
		}).error(function() {
			var alertPopup = $ionicPopup.alert({
				title: 'Uh Oh!',
				template: 'Something went wrong when publishing your deck.'
			});
		}).finally(function($ionicLoading) {
			$scope.hide($ionicLoading);
		}); 
	};

	$scope.addCourse = function() {
		$scope.show($ionicLoading);
		if(!$scope.isCourseValid($scope.course)) {
			$scope.hide($ionicLoading);
			var alertPopup = $ionicPopup.alert({
				title: 'Uh Oh!',
				template: 'Please fill out missing fields on your course before creating it.'
			});
			return;
		} else if(!$scope.isCourseFiltered($scope.course)) {
			var alertPopup = $ionicPopup.alert({
				title: 'Uh Oh!',
				template: 'Please do not create objectionable content.'
			});
			$scope.hide($ionicLoading);
			return ;
		} else if($scope.course.caption.length > 130) {
			$scope.hide($ionicLoading);
			var alertPopup = $ionicPopup.alert({
				title: 'Uh Oh!',
				template: 'You exceeded the 130 character limit for the course caption.'
			});
			return;
		}
		if($scope.f) $scope.course.image = $scope.f;
		cards.createCourse($scope.course).success(function() {
			var alertPopup = $ionicPopup.alert({
				title: 'Course Created',
				template: 'Your course has been successfully created.'
			});
			$scope.course = {};
			$ionicHistory.goBack(-1);
		}).error(function() {
			var alertPopup = $ionicPopup.alert({
				title: 'Uh Oh!',
				template: 'Something went wrong when publishing your course.'
			});
		}).finally(function($ionicLoading) {
			$scope.hide($ionicLoading);
		}); 
	};

	// MEDIA

	$scope.add = function() {

		$scope.f = document.getElementById('file').files[0];
		var r = new FileReader();
		r.onloadend = function(e) {
			var img = document.getElementById('image-preview');
			img.src = 'data:image/jpeg;base64,' + btoa(e.target.result);
			if($scope.card) $scope.card.image = img.src;
			if($scope.deck) $scope.deck.image = img.src;
			if($scope.course) $scope.course.image = img.src;

		}
		r.readAsBinaryString($scope.f);
	}
	
	// COLOR PICKER
	var setColorPicker = function(inDeck) {
		for(var i = 0; i < $scope.colors.length; i++) {
			if($( ".color-picker" ).length != 0) {
				$( ".color-picker" ).append( "<li><button type='button' id='" + $scope.colors[i].code + "'></button></li>" );
				var el = $("#" + $scope.colors[i].code);
				el.css( "background", "#" + $scope.colors[i].code );
				if(inDeck) {
					var id = el.closest('.card-in-deck').attr('id');
				} else var id = null;
				el.attr("ng-click", "addColor('" + $scope.colors[i].code + "', " + id + ", " + inDeck + ")");
				$compile(el)($scope);
			}
		}
	}
	setColorPicker(true);
	
	// two scope variables: $scope.color and $scope.blob
	$scope.addColor = function(code, id, inDeck) {
		$scope.color = $scope.findColor(code);
		if(inDeck) {
			$($($('#' + id)[i]).find('#image-file'))[0].files[0] = $scope.findColor(code).image;
		} else {
			$scope.getColor(code).success(function(res) {
				$scope.blob = FileService.b64toBlob([res], "image/jpeg");
				var objUrl = URL.createObjectURL($scope.blob);
				$scope.card.image = objUrl;
			})
		}
	}
	
	$scope.addAudio = function() {
		wavesurfer.init({
			container: '#waveform',
			waveColor: 'violet',
			progressColor: 'purple',
			height: 100,
			scrollParent: true
		});
		$scope.r = URL.createObjectURL(document.getElementById('file').files[0]);
		$scope.rPlayed = document.getElementById('file').files[0];
			if($scope.audioVars.recordType == "front-phrase") {
				$scope.card.recordingFiles[0] = $scope.rPlayed;
				$scope.card.recordings[0] = $scope.r;
			} else if($scope.audioVars.recordType == "front-example") {
				$scope.card.recordingFiles[1] = $scope.rPlayed;
				$scope.card.recordings[1] = $scope.r;
			} else if($scope.audioVars.recordType == "back-phrase") {
				$scope.card.recordingFiles[2] = $scope.rPlayed;
				$scope.card.recordings[2] = $scope.r;
			} else if($scope.audioVars.recordType == "back-example") {
				$scope.card.recordingFiles[3] = $scope.rPlayed;
				$scope.card.recordings[3] = $scope.r;
			}
			wavesurfer.loadBlob($scope.rPlayed);
	}
	
	// ADD CARD TO DECK
	
	// IMPORT CARDS
	
	$ionicModal.fromTemplateUrl('views/create/import-cards-in-deck.html', {
		scope: $scope,
		animation: 'slide-in-up'
	}).then(function(modal) {
		$scope.importCardsModal = modal;
	});

	$scope.showImportCards = function() {
		$scope.importCardsModal.show();
	};
	$scope.closeImportCards = function() {
		$scope.importCardsModal.hide();
	};
	
	$scope.m = {};
	$scope.m.importedCards = "";
	$scope.importedCardsInDeck = [];
	var importedCardsIndex = [];
	$scope.importCards = function() {
		$scope.closeImportCards();
		indexImportedCards();
		var realIndex = 0;
		for(var i = 0; i < $scope.importedCardsInDeck.length; i++) {
			var k = 0;	// k = 0: front phrase, k = 1: front pronun, k = 2: front example, k = 3: back phrase, etc.
			for(var j = 0; realIndex <= importedCardsIndex[i]; j++) {
				if($scope.m.importedCards.charAt(j) == '/' || realIndex == importedCardsIndex[i]) {
					if(k == 0) {
						$scope.importedCardsInDeck[i].frontphrase = $scope.m.importedCards.substr(0, j);
						$scope.importedCardsInDeck[i].frontphrase = replaceEmptySpaces(cleanUpSpaces($scope.importedCardsInDeck[i].frontphrase));
					} else if(k == 1) {
						$scope.importedCardsInDeck[i].frontpronun = $scope.m.importedCards.substr(0, j);
						$scope.importedCardsInDeck[i].frontpronun = replaceEmptySpaces(cleanUpSpaces($scope.importedCardsInDeck[i].frontpronun));
					} else if(k == 2) {
						$scope.importedCardsInDeck[i].frontexample = $scope.m.importedCards.substr(0, j);
						$scope.importedCardsInDeck[i].frontexample = replaceEmptySpaces(cleanUpSpaces($scope.importedCardsInDeck[i].frontexample));
					} else if(k == 3) {
						$scope.importedCardsInDeck[i].backphrase = $scope.m.importedCards.substr(0, j);
						$scope.importedCardsInDeck[i].backphrase = replaceEmptySpaces(cleanUpSpaces($scope.importedCardsInDeck[i].backphrase));
					} else if(k == 4) {
						$scope.importedCardsInDeck[i].backpronun = $scope.m.importedCards.substr(0, j);
						$scope.importedCardsInDeck[i].backpronun = replaceEmptySpaces(cleanUpSpaces($scope.importedCardsInDeck[i].backpronun));
					} else if(k == 5) {
						$scope.importedCardsInDeck[i].backexample = $scope.m.importedCards.substr(0, j);
						$scope.importedCardsInDeck[i].backexample = replaceEmptySpaces(cleanUpSpaces($scope.importedCardsInDeck[i].backexample));
					}
					$scope.m.importedCards = $scope.m.importedCards.slice(j+1);
					if(realIndex != importedCardsIndex[i]) realIndex++;
					j = 0;
					k++;
				}
				realIndex++;
			}
			k = 0;
		}
		addImportedCardsToUI();
	}
	
	var indexImportedCards = function() {
		for(var i = 0; i < $scope.m.importedCards.length; i++) {
			if($scope.m.importedCards.charAt(i) == "\n") {
				$scope.importedCardsInDeck.push({ 
					frontphrase: "",
					frontpronun: "",
					frontexample: "",
					backphrase: "",
					backpronun: "",
					backexample: ""
				});
				importedCardsIndex.push(i);
			}
		}
		$scope.importedCardsInDeck.push({
			frontphrase: "",
			frontpronun: "",
			frontexample: "",
			backphrase: "",
			backpronun: "",
			backexample: ""
		});
		importedCardsIndex.push($scope.m.importedCards.length-1);
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
	// if there is a ? mark, replace it with an empty string
	var replaceEmptySpaces = function(str) {
		if(str.includes("?")) return "";
		else return str;
	}
	// display imported cards
	var addImportedCardsToUI = function() {
		$scope.cardNumber = $('.card-in-deck').length;
		for(var i = 0; i < $scope.importedCardsInDeck.length; i++) {
			var el = $($("card-in-deck")[0]).clone();
			$(".cards-create-container").append(el);
			var idName = 'card-' + (++$scope.cardNumber);
			$(el).find(".card-in-deck").attr("id", idName);
			$(el).find(".card-number").html($scope.cardNumber);
			$(el).find("#frontphrase").val($scope.importedCardsInDeck[i].frontphrase);
			$(el).find("#frontpronun").val($scope.importedCardsInDeck[i].frontpronun);
			$(el).find("#frontexample").val($scope.importedCardsInDeck[i].frontexample);
			$(el).find("#backphrase").val($scope.importedCardsInDeck[i].backphrase);
			$(el).find("#backpronun").val($scope.importedCardsInDeck[i].backpronun);
			$(el).find("#backexample").val($scope.importedCardsInDeck[i].backexample);
		}
	}
	
	// END IMPORT CARDS
	
	$scope.cardsInDeck = [];
	$scope.createDeckMode = true;
	$scope.createTestMode = false;
	$scope.addCardsToDeck = function() {
		$scope.cardsInDeck = $('.card-in-deck');
		for(var i = 0; i < $scope.cardsInDeck.length; i++) {
			$scope.cardInDeck = {
					author: $scope.currentUser,
					frontlang: $scope.deck.lang1,
					frontphrase: $($('.card-in-deck')[i]).find('#frontphrase')[0].value,
					frontpronun: $($('.card-in-deck')[i]).find('#frontpronun')[0].value,
					frontexample: $($('.card-in-deck')[i]).find('#frontexample')[0].value,
					backlang: $scope.deck.lang2,
					backphrase: $($('.card-in-deck')[i]).find('#backphrase')[0].value,
					backpronun: $($('.card-in-deck')[i]).find('#backpronun')[0].value,
					backexample: $($('.card-in-deck')[i]).find('#backexample')[0].value,
					recordings: [],
					recordingFiles: [],
					notes: "",
					image: $($($('.card-in-deck')[i]).find('#image-file'))[0].files[0],
					categories: $scope.deck.categories,
					tags: [],
					deck: $scope.deck,
					fontstyle: "Arial",
					fontsize: 32
			};
			
			$scope.cardInDeck.recordingFiles[0] = $($($('.card-in-deck')[i]).find('#audio-file1'))[0].files[0];
			$scope.cardInDeck.recordingFiles[1] = $($($('.card-in-deck')[i]).find('#audio-file2'))[0].files[0];
			$scope.cardInDeck.recordingFiles[2] = $($($('.card-in-deck')[i]).find('#audio-file3'))[0].files[0];
			$scope.cardInDeck.recordingFiles[3] = $($($('.card-in-deck')[i]).find('#audio-file4'))[0].files[0];
			$scope.addImageToCardInDeck(i);
			$scope.addAudioToCardInDeck();
			
			angular.copy($scope.cardInDeck, $scope.card);
			// for some reason, the image does not copy over
			$scope.card.image = $scope.cardInDeck.image;
			$scope.addCard(true);
		}
		
	}
	
	$scope.addImageToCardInDeck = function(index) {

//		$scope.imageOfCardInDeck = $scope.cardsInDeck[index].image,
//		r = new FileReader();
//		r.onloadend = function(e) {
//			$scope.cardsInDeck[index].image = 'data:image/jpeg;base64,' + btoa(e.target.result);
//		}
//		r.readAsBinaryString($scope.imageOfCardInDeck);
	}
	
	$scope.addAudioToCardInDeck = function() {
		
		for(var i = 0; i < 4; i++) {
			if($scope.cardInDeck.recordingFiles[i]) $scope.cardInDeck.recordings[i] = URL.createObjectURL($scope.cardInDeck.recordingFiles[i]);
		}
	}
	
	// END ADD CARD TO DECK
	
	$scope.showCancelOptions = function(type) {
		var hideSheet = $ionicActionSheet.show({
			buttons: [
//			          { text: 'Save Draft' }
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
			        	  if(type == 'card') {
				        	  angular.copy($scope.defaultCard, $scope.card);
			        	  } else if(type == 'deck') {
			        		  $scope.deck = {};
			        	  } else if(type == 'course') {
			        		  $scope.course = {};
			        	  }
			        	  $ionicHistory.goBack(-1);
			          }
		});
	};
	
	// AUDIO
	
	$scope.audioVars = {
		recordType: "front-phrase",
		recording: false,
		playing: false,
		recordDuration: 0,
		playbackDuration: 0,
		fullDuration: 0,
		showPlayback: false
	};

	var mediaRecFile = 'recording.m4a';
	var mediaFileFullName;
//	var checkFileOnly;
	var mediaFileURL, mediaFileEntry;

	var playbackRecording = null;
	$scope.startRecord = true;
	var finishedRecord = false;
	var recordingFilePath = null;
	var wavesurfer = Object.create(WaveSurfer);
	var wavesurferInited = false;
	var ua = navigator.userAgent;
	var phoneCheck = {
			ios: ua.match(/(iphone|ipod|ipad)/i),
			blackberry: ua.match(/blackberry/i), // not used in this sample
			android: ua.match(/android/i),
			windows7: ua.match(/windows phone os 7.5/i) // not used in this sample
	};

	function onSuccessFileSystem(fileSystem) {
		console.log("***test: fileSystem.root.name: " + fileSystem.root.name);
		
		mediaRecFile = FileService.randomName(mediaRecFile);
//		if (checkFileOnly === true)
//			fileSystem.root.getFile(mediaRecFile, { create: false, exclusive: false }, onOK_GetFile, null);
//		else
			fileSystem.root.getFile(mediaRecFile, { create: true, exclusive: false }, onOK_GetFile, null);

	}
	function onOK_GetFile(fileEntry) {
		console.log("***test: File " + mediaRecFile + " at " + fileEntry.fullPath);
		mediaFileEntry = fileEntry;
		mediaFileURL = fileEntry.toURL();

		// save the full file name
		mediaFileFullName = fileEntry.fullPath;
		if (phoneCheck.ios)
			mediaRecFile = mediaFileFullName;

//		if (checkFileOnly === true) { // check if file exist at app launch.
//			mediaFileExist = true;
//		}
//		else { // record on iOS

			// create media object using full media file name
			recording = new Media(mediaFileFullName, onMediaCallSuccess, onMediaCallError);
			var options = {
			        SampleRate: 16000,
			        NumberOfChannels: 1
			    }
			//recording.startRecord();
			recording.startRecordWithCompression(options);
			console.log("Start recording");
			$scope.setRecordDuration();

			console.log(recording);
//		}
	}

	// Media() success callback
	function onMediaCallSuccess() {
		createdStatus = true;
		console.log("***test: new Media() succeeded ***");
	}

	// Media() error callback
	function onMediaCallError(error) {
		console.log("***test: new Media() failed ***");
	}
	
	function onMediaStatus(status) {
//        if(Media.MEDIA_STOPPED == status){ // playback auto finish
//            my_player.release();
//            my_player = null;
//            clearProgressTimer();
//  
//            // change to play mode
//            audioNowBtn.val('Play');
//            audioNowBtn.html('&#x25BA;Play');
//            setAudioPosition('media_pos', 0);
//            console.log("***test: new Media() status: media_stopped ***");
//        }
    }

	var startRecording = function() {
		window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, onSuccessFileSystem, function() {
			console.log("***test: failed in creating media file in requestFileSystem");
		});		
	};

	$scope.record = function() {
		if(!$scope.startRecord && !finishedRecord) {
			recording.resumeRecord();
			$scope.audioVars.recording = true;
			console.log("Resume recording");
			$scope.setRecordDuration();
		} else if($scope.startRecord && !finishedRecord) {
			$scope.startRecord = false;
			$scope.audioVars.recording = true;
			startRecording();
		}
	};
	var recordDur;
	$scope.setRecordDuration = function() {
		recordDur = setInterval(function() {
			if($scope.audioVars.recordDuration == 7000 || finishedRecord){
				$scope.finishRecord();
				$scope.audioVars.recording = false;
				$scope.audioVars.fullDuration = $scope.audioVars.recordDuration;
				clearInterval(recordDur);
				return;
			}
			if($scope.audioVars.recording) {
				$scope.audioVars.recordDuration += 10;
				updateDuration(0);
			}
			recording.getRecordLevels(
					function(result) {
						var peakPower = result.peakPower;
						if(peakPower < 100) {
							peakPower += 32;
						}
						if(peakPower > 100) {
							peakPower = 100;
						}
						$('.mic-level-indicator').css({'width': peakPower + '%'});
						console.log(JSON.stringify(result) + "dB");
					},
					function(e) {
						console.log("Error getting amp=" + e);
					}
			);
		}, 10);
	};
	var playbackDur;
	$scope.setPlaybackDuration = function() {
		playbackDur = setInterval(function() {
			if(TimeFormat.formatTime($scope.audioVars.playbackDuration) == TimeFormat.formatTime($scope.audioVars.fullDuration)) {
//			if(TimeFormat.formatTime($scope.audioVars.playbackDuration) == TimeFormat.truncateTime(wavesurfer.getDuration())) {
				$scope.stopPlayback(false);
				clearInterval(recordDur);
				return;
			}
			if($scope.audioVars.playing) {
				$scope.audioVars.playbackDuration += 10;
				updateDuration(1);
			}
		}, 10);
	};
	function updateDuration(option) {
		if(option == 0 && $scope.audioVars.recordDuration != null){
			var timeInSec = TimeFormat.formatTime($scope.audioVars.recordDuration);
			$('.record-duration').val(timeInSec);
		} else if(option == 1 && $scope.audioVars.playbackDuration != null) {
			var timeInSec = TimeFormat.formatTime($scope.audioVars.playbackDuration);
			$('.playback-duration').val(timeInSec);
		}
	};
	$scope.pauseRecord = function() {
		clearInterval(recordDur);
		recording.pauseRecord();
		$scope.audioVars.recording = false;
		console.log("Pause recording");
	};
	$scope.finishRecord = function() {
		if(!$scope.startRecord) {
			if(!finishedRecord) {
				$scope.audioVars.fullDuration = $scope.audioVars.recordDuration;
				clearInterval(recordDur);
				recording.stopRecord();
				$scope.startRecord = false;
				finishedRecord = true;
				
				mediaFileFullName = cordova.file.tempDirectory + mediaRecFile;
				if($scope.audioVars.recordType == "front-phrase") {
					$scope.card.recordingFiles[0] = mediaFileFullName;
					$scope.card.recordings[0] = recording;
				} else if($scope.audioVars.recordType == "front-example") {
					$scope.card.recordingFiles[1] = mediaFileFullName;
					$scope.card.recordings[1] = recording;
				} else if($scope.audioVars.recordType == "back-phrase") {
					$scope.card.recordingFiles[2] = mediaFileFullName;
					$scope.card.recordings[2] = recording;
				} else if($scope.audioVars.recordType == "back-example") {
					$scope.card.recordingFiles[3] = mediaFileFullName;
					$scope.card.recordings[3] = recording;
				}
			}
			$scope.audioVars.recording = false;
	
			if(!wavesurferInited) {
				wavesurfer.init({
					container: '#waveform',
					waveColor: 'violet',
					progressColor: 'purple',
					height: 100,
					scrollParent: true
				});
				wavesurferInited = true;
			}
			$scope.audioVars.showPlayback = true;
			loadRecordings();
	
			console.log("Stop recording");
		}
	};
	$scope.cancelRecord = function() {
		clearInterval(recordDur);
		//recording.stopRecord();
		$scope.startRecord = true;
		finishedRecord = false;
		$scope.audioVars.recording = false;
		$scope.audioVars.recordDuration = 0;
		if($scope.audioVars.recordType == "front-phrase") {
			$scope.card.recordingFiles[0] = null;
			$scope.card.recordings[0] = null;
		} else if($scope.audioVars.recordType == "front-example") {
			$scope.card.recordingFiles[1] = null;
			$scope.card.recordings[1] = null;
		} else if($scope.audioVars.recordType == "back-phrase") {
			$scope.card.recordingFiles[2] = null;
			$scope.card.recordings[2] = null;
		} else if($scope.audioVars.recordType == "back-example") {
			$scope.card.recordingFiles[3] = null;
			$scope.card.recordings[3] = null;
		}
		updateDuration(0);
		mediaRecFile = 'recording.m4a';
		console.log("Cancel recording");
	};
	
	var loadRecordings = function() {
		if($scope.audioVars.recordType == "front-phrase" && $scope.card.recordings[0]) {
			playbackRecording = $scope.card.recordings[0];
		} else if($scope.audioVars.recordType == "front-example" && $scope.card.recordings[1]) {
			playbackRecording = $scope.card.recordings[1];
		} else if($scope.audioVars.recordType == "back-phrase" && $scope.card.recordings[2]) {
			playbackRecording = $scope.card.recordings[2];
		} else if($scope.audioVars.recordType == "back-example" && $scope.card.recordings[3]) {
			playbackRecording = $scope.card.recordings[3];
		}

		if($scope.audioVars.recordDuration == 0) $scope.audioVars.fullDuration = playbackRecording.getDuration() * 1000;

		window.resolveLocalFileSystemURL(mediaFileFullName, function (entry) {
			entry.file(function (file) {	        	
				var reader = new FileReader();
				reader.onloadend = function() {
			        console.log("Successful file read: " + this.result);
					var blob = new Blob([new Uint8Array(this.result)], { type: "audio/m4a" });
					wavesurfer.loadBlob(blob);
				};
				reader.readAsArrayBuffer(file);	
			});
		}, function (err) {
	        console.log('Could not retrieve file, error code:', err.code);
	      });
		
//		mediaFileEntry.file(function (file) {
//			//var fileURL = URL.createObjectURL(file);
//			//wavesurfer.load(fileURL);	 
//			//wavesurfer.load(file.localURL);
//			wavesurfer.loadBlob(file);
////			var reader = new FileReader();
////		    reader.onload = function (e) {
////		        console.log(e);
////		        wavesurfer.loadArrayBuffer(e.target.result);
////		    };
////		    reader.onerror = function (e) {
////		        console.error(e);
////		    };
////		    reader.readAsArrayBuffer(file);
//		}, function() {
//			console.log("error converting to File");
//		});
		var timeInSec = TimeFormat.formatTime($scope.audioVars.fullDuration);
		$('.playback-full-duration').val(timeInSec);
	}

	$(document).on('change','.audio-select',function(){
		$scope.audioVars.showPlayback = false;
		$('.recording-row').removeClass('ng-hide');
		$('.playback-row').addClass('ng-hide');
		
		$scope.startRecord = true;
		finishedRecord = false;
		$scope.audioVars.recording = false;
		$scope.audioVars.playing = false;
		$scope.audioVars.recordDuration = 0;
		$scope.audioVars.playbackDuration = 0;
		updateDuration(0);
		if($scope.audioVars.recording) $scope.cancelRecord();
		if($scope.audioVars.playing) $scope.stopPlayback(true);
		$('.mic-level-indicator').css({'width': '0%'});
		$scope.audioVars.recordType = $('.audio-select').val();
		if($scope.audioVars.recordType == "front-phrase" && $scope.card.recordings[0]) {
			$scope.audioVars.showPlayback = true;
			$('.recording-row').addClass('ng-hide');
			$('.playback-row').removeClass('ng-hide');
			$scope.startRecord = false;
			finishedRecord = true;
			playbackRecording = $scope.card.recordings[0];
			$scope.loadAudio();
//			loadRecordings();
		} else if($scope.audioVars.recordType == "front-example" && $scope.card.recordings[1]) {
			$scope.audioVars.showPlayback = true;
			$('.recording-row').addClass('ng-hide');
			$('.playback-row').removeClass('ng-hide');
			$scope.startRecord = false;
			finishedRecord = true;
			playbackRecording = $scope.card.recordings[1];
			$scope.loadAudio();
//			loadRecordings();
		} else if($scope.audioVars.recordType == "back-phrase" && $scope.card.recordings[2]) {
			$scope.audioVars.showPlayback = true;
			$('.recording-row').addClass('ng-hide');
			$('.playback-row').removeClass('ng-hide');
			$scope.startRecord = false;
			finishedRecord = true;
			playbackRecording = $scope.card.recordings[2];
			$scope.loadAudio();
//			loadRecordings();
		} else if($scope.audioVars.recordType == "back-example" && $scope.card.recordings[3]) {
			$scope.audioVars.showPlayback = true;
			$('.recording-row').addClass('ng-hide');
			$('.playback-row').removeClass('ng-hide');
			$scope.startRecord = false;
			finishedRecord = true;
			playbackRecording = $scope.card.recordings[3];
			$scope.loadAudio();
//			loadRecordings();
		} else {
			$scope.cancelRecord();
		}
	});

	$scope.editRecording = function() {
		$scope.audioVars.showPlayback = false;
	}
	
	$scope.playback = function() {
		if(playbackRecording) {
			$scope.audioVars.playbackDuration = 0;
//			playbackRecording.play();
			wavesurfer.play();
			$scope.audioVars.playing = true;
			$scope.setPlaybackDuration();
		}
	};
	$scope.pausePlayback = function() {
		if(playbackRecording) {
			clearInterval(playbackDur);
//			playbackRecording.pause();
			wavesurfer.playPause();
			$scope.audioVars.playing = false;
		}
	};
	$scope.stopPlayback = function(clearAudio) {
		if(playbackRecording) {
			if($scope.audioVars.playing) {
				clearInterval(playbackDur);
				$scope.audioVars.playing = false;	
			}
			if(clearAudio) {
				wavesurfer.stop();
				wavesurfer.drawer.progress(0);
				$scope.audioVars.playbackDuration = 0;
			}
			updateDuration(1);
		}
	};
	
	$scope.currentRecording = new Audio();
	$scope.playRecording = function(index) {
		if($scope.card.recordingFiles[index]) {
			if($scope.card.recordings[index].substr(0, 12) == 'blob:http://') var fileURL = $scope.card.recordings[index];
			else var fileURL = URL.createObjectURL($scope.card.recordingFiles[index]);
			$scope.currentRecording.src = fileURL;
			$scope.currentRecording.play();
		}
	}
	
	/* CREATE METACARD */
	$scope.metacard = {};
	$scope.metacard.content = '<h2>Metacard</h2><p>This is where you put all the content</p>';
    $scope.htmlcontent = $scope.metacard.content;
    $scope.disabled = false;
	
    $scope.addMetacard = function() {
		$scope.show($ionicLoading);
		if(!$scope.isMetacardValid($scope.metacard)) {
			var alertPopup = $ionicPopup.alert({
				title: 'Uh Oh!',
				template: 'Please fill out missing fields on your metacard before creating it.'
			});
			$scope.hide($ionicLoading);
			return ;
		} else if(!$scope.isMetacardFiltered($scope.metacard)) {
			var alertPopup = $ionicPopup.alert({
				title: 'Uh Oh!',
				template: 'Please do not create objectionable content.'
			});
			$scope.hide($ionicLoading);
			return ;
		}
		cards.createMetacard($scope.metacard).success(function() {
			var alertPopup = $ionicPopup.alert({
				title: 'Metacard Published',
				template: 'Your metacard has been successfully published.'
			});
		}).error(function(err) {
			var alertPopup = $ionicPopup.alert({
				title: 'Uh Oh!',
				template: 'Something went wrong when publishing your metacard.'
			});
		}).finally(function($ionicLoading) {
			$scope.hide($ionicLoading);
		});
	};
    
	/* CREATE TEST */
	
	$scope.test = {};
    
    if($ionicHistory.currentStateName().substr(0, 13) == 'createTest') {
    	$scope.createTestMode = true;
    	$scope.test.content = '';
        $scope.htmlcontent = $scope.test.content;
    	$(document).ready(function() {
    	    $('input[type=radio][name=format]').change(function() {
    	        // insert new rows in textAngular
    	        $scope.appendTextEditor(this.value);
    	        $scope.test.format = this.value;
    	    });
    	});
    }
    
    $scope.appendTextEditor = function(format) {
    	if(format == "reading") {
        	$scope.test.content = '<h3>Reading Comprehension</h3><h5>Read the following passage and answer the questions.</h5><blockquote class="test-prompt"><textarea placeholder="This is where you put your passage."></textarea></blockquote><ol></ol>';
    	} else if(format == "video") {
        	$scope.test.content = '<h3>Video Comprehension</h3><h5>Watch the following video and answer the questions.</h5><blockquote class="test-prompt"><p>&lt;insert video here&gt;</p></blockquote><ol></ol>';
    	} else if(format == "audio") {
        	$scope.test.content = '<h3>Audio Comprehension</h3><h5>Listen to the following audio and answer the questions.</h5><blockquote class="test-prompt"><p>&lt;insert audio here&gt;</p></blockquote><ol></ol>';
    	}
    	$scope.appendSection(1);
    	$scope.appendSection(2);
    	$scope.htmlcontent = $scope.test.content;
    	$scope.convertHTMLToTest();
    }
    
    $scope.convertHTMLToTest = function() {
    	var htmlBody = $scope.htmlcontent;
		var parser = new DOMParser();
		var doc = parser.parseFromString(htmlBody, "text/html");
		$('.create-test-container .test-body').empty();
		$('.create-test-container .test-body').append(doc.firstChild);
		$compile($('.create-test-container .test-body')[0])($scope);

    	$('textarea').autoResize();
    }
    
//    var appendToolbarSection = function() {
//    	if(format == "reading" || format == "video" || format == "audio") {
//    		if($('.btn-group.test-section.comprehension').length == 0) {
//        		var el = $compile('<div class="btn-group test-section comprehension">'
//            			+ '<button type="button" class="btn btn-default" name="multiple-choice-section" ta-button="ta-button" ng-disabled="isDisabled()" tabindex="-1" ng-click="appendSection(1)" ng-class="displayActiveToolClass(active)" title="Create a multiple-choice quiz section" unselectable="on"><i class="fa fa-plus"></i> Multiple choice <i class="fa fa-circle-thin"></i></button>'
//            			+ '<button type="button" class="btn btn-default" name="short-answer-section" ta-button="ta-button" ng-disabled="isDisabled()" tabindex="-1" ng-click="appendSection(2)" ng-class="displayActiveToolClass(active)" title="Create a short-answer quiz section" unselectable="on"><i class="fa fa-plus"></i> Short answer <i class="fa fa-comment-o"></i></button>'
//            			+ '</div>')($scope);
//        		$('.ta-toolbar').append(el);
//        	}
//    	} else if(format == "essay") {
//    		if($('.btn-group.test-section.essay').length == 0) {
//        		var el = $compile('<div class="btn-group test-section essay">'
//            			+ '<button type="button" class="btn btn-default" name="essay-section" ta-button="ta-button" ng-disabled="isDisabled()" tabindex="-1" ng-click="appendSection(3)" ng-class="displayActiveToolClass(active)" title="Create a essay section" unselectable="on"><i class="fa fa-plus"></i> Essay box <i class="fa fa-pencil"></i></button>'
//            			+ '</div>')($scope);
//        		$('.ta-toolbar').append(el);
//        	}
//    	} else if(format == "speech") {
//    		if($('.btn-group.test-section.speech').length == 0) {
//        		var el = $compile('<div class="btn-group test-section speech">'
//            			+ '<button type="button" class="btn btn-default" name="speech-section" ta-button="ta-button" ng-disabled="isDisabled()" tabindex="-1" ng-click="appendSection(4)" ng-class="displayActiveToolClass(active)" title="Create a speech section" unselectable="on"><i class="fa fa-plus"></i> Speech recording <i class="fa fa-microphone"></i></button>'
//            			+ '</div>')($scope);
//        		$('.ta-toolbar').append(el);
//        	}
//    	}
//    }
    
	$scope.appendSection = function(type) {
		var index = $scope.test.content.indexOf("<ol></ol>");
		if(index == -1) var index = $scope.test.content.indexOf("</ol>")-4;
		if(index <= -1) return;

		var id = ($scope.test.content.match(/<li class="test-question/g) || []).length+1;
		
		if(type == 1) $scope.test.content = $scope.test.content.slice(0, index+4)
				+ '<li class="test-question multiple-choice" id="' + id + '">'
				+ '<div class="test-choice">​<input type="text" class="form-control question" id="' + id + '" placeholder="Your question here"/></div>' 
				+ '<div class="test-choice"><input type="radio" value="value1" name="' + id + '"/> <input type="text" class="form-control answer" id="' + id + '" placeholder="Value 1"/></div>'
				+ '<div class="test-choice"><input type="radio" value="value2" name="' + id + '"/> <input type="text" class="form-control answer" id="' + id + '" placeholder="Value 2"/></div>'
				+ '<div class="test-choice"><input type="radio" value="value3" name="' + id + '"/> <input type="text" class="form-control answer" id="' + id + '" placeholder="Value 3"/></div>'
				+ '<div class="test-choice"><input type="radio" value="value4" name="' + id + '"/> <input type="text" class="form-control answer" id="' + id + '" placeholder="Value 4"/></div></li>'
				+ $scope.test.content.slice(index+4);
		else if(type == 2) $scope.test.content = $scope.test.content.slice(0, index+4)
				+ '<li class="test-question short-answer" id="' + id + '">'
				+ '<div class="test-choice"><input type="text" class="form-control question" id="' + id + '" placeholder="Your question here"/></div>'
				+ '<input type="text" class="form-control answer" id="' + id + '" placeholder="Correct answer here"/></li>' 
				+ $scope.test.content.slice(index+4);
		else if(type == 3) $scope.test.content = $scope.test.content.slice(0, index+4)
				+ '<li class="test-question essay" id="' + id + '">​(The answer will be graded by you, the creator, or others you deem qualified)<br/>'
				+ '<div class="test-choice"><input type="text" class="form-control question" id="' + id + '" placeholder="Your prompt here"/></div>'
				+ '<textarea class="essay-input" id="' + id + '"></textarea></li>'
				+ $scope.test.content.slice(index+4);
		else if(type == 4) $scope.test.content = $scope.test.content.slice(0, index+4)
				+ '<li class="test-question speech" id="' + id + '">(The answer will be graded by you, the creator, or others you deem qualified)<br/>'
				+ '<div class="test-choice"><input type="text" class="form-control question" id="' + id + '" placeholder="Your prompt here"/></div>'
				+ '<textarea class="essay-input" id="' + id + '"></textarea></li>'
				+ $scope.test.content.slice(index+4);
		
		// if blank-question already exists, get rid of it
		var blankIndex = $scope.test.content.indexOf('<li class="blank-question">');
		if(blankIndex > -1) {
			var lastIndex = $scope.test.content.indexOf('</li>', blankIndex)+4;
			$scope.test.content = $scope.test.content.slice(0, blankIndex) + $scope.test.content.slice(lastIndex+1);
		}
		
		// add blank-question to end of htmlcontent
		var index = $scope.test.content.indexOf("<ol></ol>");
		if(index == -1) var index = $scope.test.content.indexOf("</ol>")-4;
		$scope.test.content = $scope.test.content.slice(0, index+4)
				+ '<li class="blank-question">Create new question<br/>'
				+ '<div class="btn-group test-section comprehension">'
    			+ '<button type="button" class="btn btn-default" name="multiple-choice-section" ng-click="appendSection(1)" title="Create a multiple-choice quiz section">Multiple choice <i class="fa fa-circle-thin"></i></button>'
    			+ '<button type="button" class="btn btn-default" name="short-answer-section" ng-click="appendSection(2)" title="Create a short-answer quiz section">Short answer <i class="fa fa-comment-o"></i></button>'
    			+ '<button type="button" class="btn btn-default" name="essay-answer-section" ng-click="appendSection(3)" title="Create an essay-answer quiz section">Essay answer <i class="fa fa-file-text-o"></i></button>'
//    			+ '<button type="button" class="btn btn-default" name="audio-answer-section" ng-click="appendSection(4)" title="Create a recording-answer quiz section">Audio answer <i class="fa fa-microphone"></i></button>'
    			+ '</div></li>'
				+ $scope.test.content.slice(index+4);
		
		$scope.htmlcontent = $scope.test.content;
    	$scope.convertHTMLToTest();
	}
	$scope.isTestContentValid = function() {
		// if textarea, check that textarea is filled
		var testPromptInput = $('.test-prompt').children()[0]
		if(testPromptInput.type == "textarea") {
			if(!testPromptInput.value) return False
		} else if(testPromptInput.type == "video") {
			if(!testPromptInput.value) return False
		} else if(testPromptInput.type == "audio") {
			if(!testPromptInput.value) return False
		}
		
		for(var i = 0; i < $('.test-question').length; i++) {
			var testQuestion = $($('.test-question')[i])
			// check that there is a question/prompt for each question
			if(!testQuestion.find(".question")[0].value) {
				return false
			}
			
			// if multiple choice, check that there are answers written for each blank and one is selected as the correct answer
			if(testQuestion.find("input[type=radio]").length != 0) {
				if(testQuestion.find("input[type=radio]:checked").length == 0) return False
				for(var j = 0; j < testQuestion.find(".answer").length; j++) {
					if(!testQuestion.find(".answer")[j].value) return false
				}
			}
			
			// if short answer, check that there is a correct answer written in the blank
			if(testQuestion.find("input[type=text].answer").length != 0) {
				if(!testQuestion.find("input[type=text].answer")[0].value) return false
			}
		}
		return true
	}
	
	// make sure user does not input / or " in the answer
	var parseTest = function() {
		$scope.test.content = $scope.htmlcontent;
		
		// first, get rid of the blank-question
		var blankIndex = $scope.test.content.indexOf('<li class="blank-question">');
		if(blankIndex > -1) {
			var lastIndex = $scope.test.content.indexOf('</li>', blankIndex)+4;
			$scope.test.content = $scope.test.content.slice(0, blankIndex) + $scope.test.content.slice(lastIndex+1);
		}
		
		// reading comprehension
		var blockquoteIndex = $scope.test.content.indexOf('<blockquote class="test-prompt"');
		if(blockquoteIndex > -1) {
			// replace passage textarea with p text
			var lastIndex = $scope.test.content.indexOf('</blockquote>', blockquoteIndex);
			$scope.test.content = $scope.test.content.slice(0, blockquoteIndex+32) 
				+ "<p>" + $('blockquote.test-prompt textarea').val() + "</p>"
				+ $scope.test.content.slice(lastIndex);
		}
		
		for(var i = 0; i < $('.test-body ol li.test-question').length; i++) {

			// multiple choice questions
			if($($('.test-body ol li.test-question')[i]).hasClass('multiple-choice')) {
				// replace all value="" with text
				// replace all choices input[text] with span text
				for(var j = 0; j < $('input[name="' + (i+1) + '"]').length; j++) {
					var choiceValue = $($('input#' + (i+1) + '.answer')[j]).val();
					$($('input[name="' + (i+1) + '"]')[j]).val(choiceValue);
					
					var choiceIndex = $scope.test.content.indexOf('<input type="radio" value="value' + (j+1) + '" name="' + (i+1) + '"/>');
					$scope.test.content = $scope.test.content.slice(0, choiceIndex+27) 
						+ choiceValue
						+ $scope.test.content.slice(choiceIndex+33);
					
					var choiceInputIndex = $scope.test.content.indexOf('<input type="text" class="form-control answer" id="' + (i+1) + '"', choiceIndex);
					var lastIndex = $scope.test.content.indexOf('</div>', choiceInputIndex);
					$scope.test.content = $scope.test.content.slice(0, choiceInputIndex) 
						+ choiceValue
						+ $scope.test.content.slice(lastIndex);
				}
				
				// replace question input[text] with pure text
				// get correct choice and write its value in <b class="answer"></b>
				var questionIndex = $scope.test.content.indexOf('<input type="text" class="form-control question" id="' + (i+1) + '"');
				var lastIndex = $scope.test.content.indexOf('</div>', questionIndex);
				$scope.test.content = $scope.test.content.slice(0, questionIndex) 
					+ $('.test-body ol li.test-question input#' + (i+1) + '.question').val()
					+ " <b class='answer'>" + $('.test-body ol li.test-question input[name="' + (i+1) + '"]:checked').val() + "</b>"
					+ $scope.test.content.slice(lastIndex);
			
			// short answer questions
			} else if($($('.test-body ol li.test-question')[i]).hasClass('short-answer')) {
				// replace question input[text] with pure text
				// get correct answer and write its value in <b class="answer"></b>
				var questionIndex = $scope.test.content.indexOf('<input type="text" class="form-control question" id="' + (i+1) + '"');
				var lastIndex = $scope.test.content.indexOf('</div>', questionIndex);
				$scope.test.content = $scope.test.content.slice(0, questionIndex) 
					+ $('.test-body ol li.test-question input#' + (i+1) + '.question').val()
					+ " <b class='answer'>" + $('.test-body ol li.test-question input#' + (i+1) + '.answer').val() + "</b>"
					+ $scope.test.content.slice(lastIndex);
			
			// essay questions
			} else if($($('.test-body ol li.test-question')[i]).hasClass('essay')) {
				
				
			// speech questions
			} else if($($('.test-body ol li.test-question')[i]).hasClass('speech')) {
				
			}
		}
		
		if($scope.test.deck && $scope.test.deck != "null") {
			$scope.test.deck = JSON.parse($scope.test.deck);
			$scope.test.course = null;
		} else if($scope.test.course && $scope.test.course != "null") {
			$scope.test.course = JSON.parse($scope.test.course);
			$scope.test.deck = null;
		}
	}
	
    $scope.addTest = function() {
		$scope.show($ionicLoading);
		if(!$scope.isTestValid($scope.test)) {
			var alertPopup = $ionicPopup.alert({
				title: 'Uh Oh!',
				template: 'Please fill out missing fields on your test before creating it.'
			});
			$scope.hide($ionicLoading);
			return ;
		} else if(!$scope.isTestContentValid()) {
			var alertPopup = $ionicPopup.alert({
				title: 'Uh Oh!',
				template: 'Please check that you wrote/selected the answer for each question.'
			});
			$scope.hide($ionicLoading);
			return ;
		} else if(!$scope.isTestFiltered($scope.test)) {
			var alertPopup = $ionicPopup.alert({
				title: 'Uh Oh!',
				template: 'Please do not create objectionable content.'
			});
			$scope.hide($ionicLoading);
			return ;
		}
		// also check if answers are given for each question
		parseTest();
		cards.createTest($scope.test).success(function() {
			var alertPopup = $ionicPopup.alert({
				title: 'Test Published',
				template: 'Your test has been successfully published.'
			});
		}).error(function(err) {
			var alertPopup = $ionicPopup.alert({
				title: 'Uh Oh!',
				template: 'Something went wrong when publishing your test.'
			});
		}).finally(function($ionicLoading) {
			$scope.hide($ionicLoading);
		});
	};
}])