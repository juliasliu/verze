angular.module('App').controller('CreateCtrl', [
'$rootScope',
'$scope',
'$state',
'$ionicHistory',
'$timeout',
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
'auth',
'cards',
'BadFilter',
function($rootScope, $scope, $state, $ionicHistory, $timeout, $ionicActionSheet, $timeout, $ionicModal, $ionicPopup, $ionicPopover, $cordovaFile, $ionicLoading, FileService, ImageService, TimeFormat, Misc, auth, cards, BadFilter) {
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
	$scope.languages = Misc.languages();
	$scope.findLanguage = function(name) {
		return Misc.findLanguage(name);
	}
	$scope.categories = Misc.categories();
	$scope.levels = Misc.levels();
	
	$scope.editMode = true;
	$scope.searchMode = false;
	$scope.decks = cards.decks;
	$scope.courses = cards.courses;
	$scope.deck = {};
	$scope.course = {};
	$scope.card = {};
	
	// CARD PARTS
	
	$scope.showCardParts = { showPronun: true, showExample: true, showMagic: true };

	$scope.isLoggedIn = auth.isLoggedIn;
	$scope.currentUser = $rootScope.currentUser;
	
	$scope.getUser = function(user, getAll) {
		$scope.show($ionicLoading);
		$scope.user = user;

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
			$scope.hide($ionicLoading);
		})
	};

	$scope.getUser($scope.currentUser, false);
	
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
		$scope.tags = null;
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
	    if((e.which == 13 || e.which == 188) && $scope.template=='views/create/create-form/create-form-extra.html' && !$scope.tags) {
	    	$scope.tags = $('#tags').tagsinput("items");
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
	
	// CREATE CARD, DECK, COURSE
	
	$scope.addCard = function() {
		$scope.show($ionicLoading);
		if($scope.tags) $scope.card.tags = $scope.tags.itemsArray;
		if(!$scope.card.frontlang || $scope.card.frontlang === ''
			|| !$scope.card.frontphrase || $scope.card.frontphrase === ''
			|| !$scope.card.frontpronun || $scope.card.frontpronun === ''
			|| !$scope.card.backlang || $scope.card.backlang === ''
			|| !$scope.card.backphrase || $scope.card.backphrase === ''
			|| !$scope.card.backpronun || $scope.card.backpronun === ''
			|| !$scope.card.recordingFiles || !$scope.card.recordingFiles[0] || !$scope.card.recordingFiles[2]
			|| !$scope.card.image || $scope.card.image == "images/mexico-city-gif.gif"
			|| !$scope.card.categories
//			|| !$scope.card.tags || $scope.card.tags.length == 0
			|| !$scope.card.deck
			|| !$scope.card.fontstyle || !$scope.card.fontsize) {
			var alertPopup = $ionicPopup.alert({
				title: 'Uh Oh!',
				template: 'Please fill out missing fields on your card before creating it.'
			});
			$scope.hide($ionicLoading);
			return ;
		} else if(BadFilter.containBadWords($scope.card.frontphrase) ||
				BadFilter.containBadWords($scope.card.frontpronun) ||
				BadFilter.containBadWords($scope.card.backphrase) ||
				BadFilter.containBadWords($scope.card.backpronun) ) {
			var alertPopup = $ionicPopup.alert({
				title: 'Uh Oh!',
				template: 'Please do not create objectionable content.'
			});
			$scope.hide($ionicLoading);
			return ;
		}
		cards.createCard($scope.card).success(function() {
			var alertPopup = $ionicPopup.alert({
				title: 'Card Published',
				template: 'Your card has been successfully published.'
			});
//			angular.copy($scope.defaultCard, $scope.card);
			$scope.tags = null;
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
		if(!$scope.deck.name || $scope.deck.name === ''
			|| !$scope.deck.lang1 || !$scope.deck.lang2
			|| !$scope.deck.categories || !$scope.deck.course
			|| !$scope.deck.image) {
			$scope.hide($ionicLoading);
			var alertPopup = $ionicPopup.alert({
				title: 'Uh Oh!',
				template: 'Please fill out missing fields on your deck before creating it.'
			});
			return;
		} else if(BadFilter.containBadWords($scope.deck.name)) {
			var alertPopup = $ionicPopup.alert({
				title: 'Uh Oh!',
				template: 'Please do not create objectionable content.'
			});
			$scope.hide($ionicLoading);
			return ;
		}
		
		cards.createDeck($scope.deck).success(function() {
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
		if(!$scope.course.name || $scope.course.name === ''
			|| !$scope.course.caption || !$scope.course.lang1
			|| !$scope.course.lang2 || !$scope.course.categories
			|| !$scope.course.difficulty || !$scope.course.image) {
			$scope.hide($ionicLoading);
			var alertPopup = $ionicPopup.alert({
				title: 'Uh Oh!',
				template: 'Please fill out missing fields on your course before creating it.'
			});
			return;
		} else if(BadFilter.containBadWords($scope.course.name) ||
				BadFilter.containBadWords($scope.course.caption)) {
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
			if(type == "card") {
				$scope.card.image = res;
			} else if(type == "deck") {
				$scope.deck.image = res;
			} else if(type == "course") {
				$scope.course.image = res;
			}
		});
	}

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
		recording.stopRecord();
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
		if($scope.audioVars.recordType == "front-phrase" && $scope.card.recordings[0] && $scope.card.recordingFiles[0]) {
			$scope.audioVars.showPlayback = true;
			$scope.startRecord = false;
			finishedRecord = true;
			loadRecordings();
		} else if($scope.audioVars.recordType == "front-example" && $scope.card.recordings[1] && $scope.card.recordingFiles[1]) {
			$scope.audioVars.showPlayback = true;
			$scope.startRecord = false;
			finishedRecord = true;
			loadRecordings();
		} else if($scope.audioVars.recordType == "back-phrase" && $scope.card.recordings[2] && $scope.card.recordingFiles[2]) {
			$scope.audioVars.showPlayback = true;
			$scope.startRecord = false;
			finishedRecord = true;
			loadRecordings();
		} else if($scope.audioVars.recordType == "back-example" && $scope.card.recordings[3] && $scope.card.recordingFiles[3]) {
			$scope.audioVars.showPlayback = true;
			$scope.startRecord = false;
			finishedRecord = true;
			loadRecordings();
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
			playbackRecording.play();
//			wavesurfer.play();
			$scope.audioVars.playing = true;
			$scope.setPlaybackDuration();
		}
	};
	$scope.pausePlayback = function() {
		if(playbackRecording) {
			clearInterval(playbackDur);
			playbackRecording.pause();
//			wavesurfer.playPause();
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
//				wavesurfer.stop();
//				wavesurfer.drawer.progress(0);
				playbackRecording.stop();
				$scope.audioVars.playbackDuration = 0;
			}
			updateDuration(1);
		}
	};
	
	$scope.playRecording = function(index) {
		if($scope.card.recordings[index]) {
			$scope.card.recordings[index].play();
		}
	}
}])