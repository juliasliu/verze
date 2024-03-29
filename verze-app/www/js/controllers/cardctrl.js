angular.module('App').controller('CardCtrl', [
'$rootScope',
'$scope',
'$state',
'$timeout',
'$ionicHistory',
'$ionicPopup',
'$ionicPopover',
'$ionicModal',
'$ionicActionSheet',
'$ionicLoading',
'ImageService',
'FileService',
'Misc',
'DateFormat',
'TimeFormat',
'auth',
'users',
'cards',
'report',
'BadFilter',
function($rootScope, $scope, $state, $timeout, $ionicHistory, $ionicPopup, $ionicPopover, $ionicModal, $ionicActionSheet, $ionicLoading, ImageService, FileService, Misc, DateFormat, TimeFormat, auth, users, cards, report, BadFilter) {
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
	//CARD MODAL
	
	$scope.editMode = false;
	if($state.params.card) {
		$scope.card = {};
		$scope.show($ionicLoading);
		cards.getCard($state.params.card, true).success(function(data) {
			$scope.card = cards.currentCard;
			$scope.card.recordings = [null, null, null, null];
			$scope.checkLoveCard();
			cards.getAll('Decks').success(function(data) {
				$scope.decks = cards.decks;
				$scope.myDecks = cards.myDecks;
				$scope.getCardSaved();
				$scope.hide($ionicLoading);
			})
		})
		
		if($ionicHistory.currentStateName().substr(0, 13) == 'tabs.editCard') {
			$scope.editMode = true;
		}
		
	}
	
	$scope.onEditCardClick = function(id) {
		if($ionicHistory.currentHistoryId() == 'ion1') {
			$state.go('tabs.editCard1', { card: id });
		} else if($ionicHistory.currentHistoryId() == 'ion2') {
			$state.go('tabs.editCard2', { card: id });
		} else if($ionicHistory.currentHistoryId() == 'ion4') {
			$state.go('tabs.editCard3', { card: id });
		}
	}
	
	$scope.formatDate = function(date) {
		return DateFormat.formatDate(date);
	};
	$scope.languages = Misc.languages();
	$scope.findLanguage = function(name) {
		return Misc.findLanguage(name);
	}
	$scope.countries = Misc.countries();
	
	$scope.currentUser = $rootScope.currentUser;
	
	$scope.showMagic = true;
	
	$scope.goToCardDeck = function() {
		$scope.closeCard();
		$scope.showDeck($scope.card.deck);
	}
	
	$scope.refreshCard = function() {
		cards.getCard($scope.card._id, true)
		.success(function(data) {
			$scope.card = data.card;
			$scope.checkLoveCard();
			$scope.decks = cards.decks;
			$scope.myDecks = $scope.decks;
			$scope.getCardSaved();
		})
		.finally(function() {
			$scope.$broadcast('scroll.refreshComplete');
		});
	};
	
	$scope.checkLoveCard = function() {
		if($scope.currentUser.loved.indexOf($scope.card._id) == -1) {
			$('.card-love-btn').css({"color": "rgba(255, 255, 255, 0.75)"});
		} else {
			$('.card-love-btn').css({"color": "rgba(0, 204, 150, 0.75)"});
		}
	}
	
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
	
	$scope.currentRecording = new Audio();
	$scope.playRecording = function(index) {
		if($scope.card.recordingFiles[index]) {
			$scope.currentRecording.src = $scope.card.recordingFiles[index];
			$scope.currentRecording.play();
		} else if($scope.card.recordings[index]) {
			$scope.card.recordings[index].play();
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
	
	// FLAG CONTENT
	
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
		var date = new Date();
		$scope.problem.description = "[FLAGGED CONTENT] " + date.toString() + "; " + $scope.flagId + " : " + $scope.problem.description;
		
		if(!$scope.problem.description || $scope.problem.description == ''
			|| !$scope.problem.email || $scope.problem.email == '') {
			var alertPopup = $ionicPopup.alert({
				title: 'Uh Oh!',
				template: 'Please fill out the description and email before flagging the content.'
			});
			$scope.hide($ionicLoading);
			return ;
		}
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
	
	$ionicPopover.fromTemplateUrl('views/profile/save/save-card.html', {
		scope: $scope
	}).then(function(popover) {
		$scope.saveCardPopover = popover;
	});

	$scope.openSaveCardPopover = function($event) {
		$scope.saveCardPopover.show($event);
	};
	$scope.closeSaveCardPopover = function() {
		$scope.saveCardPopover.hide();
	};
	
	$scope.getCardSaved = function() {
		for(var i = 0; i < $scope.myDecks.length; i++) {
			if($scope.myDecks[i].content.cards.map(function(x) { return x._id; }).indexOf($scope.card._id) != -1) {
				$scope.myDecks[i].savedCard = true;
			} else {
				$scope.myDecks[i].savedCard = false;
			}
		}
	}
	
	$scope.saveToDeck = function(deck) {
		$scope.closeSaveCardPopover();
		if(deck && deck.cards.map(function(x) { return x._id; }).indexOf($scope.card._id) != -1) {
			var confirmPopup = $ionicPopup.confirm({
				title: 'Unsave Card',
				template: 'Are you sure you want to unsave this card?'
			});

			confirmPopup.then(function(res) {
				if(res) {
					$scope.show($ionicLoading);
					cards.unsaveCard($scope.card).success(function() {
						var alertPopup = $ionicPopup.alert({
							title: 'Card Unsaved',
							template: 'You have successfully unsaved the card.'
						});
						$scope.refreshCard($scope.card._id);
					}).error(function() {
						var alertPopup = $ionicPopup.alert({
							title: 'Uh Oh!',
							template: 'Something went wrong when unsaving the card.'
						});
					}).finally(function($ionicLoading) {
						$scope.hide($ionicLoading);
					}); 
				}
			});
		} else {
			$scope.show($ionicLoading);
			cards.saveCard($scope.card, deck).success(function() {
				var alertPopup = $ionicPopup.alert({
					title: 'Card Saved',
					template: 'You have successfully saved the card.'
				});
				$scope.refreshCard($scope.card._id);
			}).error(function() {
				var alertPopup = $ionicPopup.alert({
					title: 'Uh Oh!',
					template: 'Something went wrong when saving the card.'
				});
			}).finally(function($ionicLoading) {
				$scope.hide($ionicLoading);
			});
		}
	}
	
	$scope.refreshDecks = function() {
		cards.getAll("Decks")
		.success(function(data) {
			$scope.myDecks = data;
		})
		.finally(function() {
			$scope.$broadcast('scroll.refreshComplete');
		});
	}
	
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
	
	// UPDATE CARD
	
	$scope.template = 'views/create/create-form/create-form-info.html';
	$scope.decks = cards.decks;
	
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

	$scope.$watchGroup(['card.image', 'card.fontstyle', 'card.font-size', 'card.tags'], function(newValues, oldValues) {
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
	
	/* MEDIA */
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
			$scope.card.image = res;
		});
	}
	
	
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
		var timeInSec = TimeFormat.formatTime($scope.audioVars.fullDuration);
		$('.playback-full-duration').val(timeInSec);
	}

	$(document).on('change','.audio-select',function(){
		if($ionicHistory.currentStateName().substr(0, 13) == 'tabs.editCard') {
			
		}
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
		if($('.audio-select').find(":selected").text() == "Front Phrase" && $scope.card.recordings[0] && $scope.card.recordingFiles[0]) {
			$scope.audioVars.showPlayback = true;
			$scope.startRecord = false;
			finishedRecord = true;
			loadRecordings();
		} else if($('.audio-select').find(":selected").text() == "Front Example" && $scope.card.recordings[1] && $scope.card.recordingFiles[1]) {
			$scope.audioVars.showPlayback = true;
			$scope.startRecord = false;
			finishedRecord = true;
			loadRecordings();
		} else if($('.audio-select').find(":selected").text() == "Back Phrase" && $scope.card.recordings[2] && $scope.card.recordingFiles[2]) {
			$scope.audioVars.showPlayback = true;
			$scope.startRecord = false;
			finishedRecord = true;
			loadRecordings();
		} else if($('.audio-select').find(":selected").text() == "Back Example" && $scope.card.recordings[3] && $scope.card.recordingFiles[3]) {
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

	$scope.addCard = function() {
		$scope.show($ionicLoading);
		if($scope.tags) $scope.card.tags = $scope.tags.itemsArray;
		if($scope.card.deck == null) $scope.card.deck = "null";
		if(!$scope.card.frontlang || $scope.card.frontlang === ''
			|| !$scope.card.frontphrase || $scope.card.frontphrase === ''
			|| !$scope.card.frontpronun || $scope.card.frontpronun === ''
//			|| !$scope.card.frontexample || $scope.card.frontexample === ''
			|| !$scope.card.backlang || $scope.card.backlang === ''
			|| !$scope.card.backphrase || $scope.card.backphrase === ''
			|| !$scope.card.backpronun || $scope.card.backpronun === ''
//			|| !$scope.card.backexample || $scope.card.backexample === ''
			|| !$scope.card.recordingFiles || !$scope.card.recordingFiles[0] || !$scope.card.recordingFiles[2]
//			|| !$scope.card.notes || $scope.card.notes === ''
			|| !$scope.card.image || !$scope.card.categories
//			|| !$scope.card.tags || $scope.card.tags.length == 0
			|| !$scope.card.deck
			|| !$scope.card.fontstyle || !$scope.card.fontsize) {
			var alertPopup = $ionicPopup.alert({
				title: 'Uh Oh!',
				template: 'Please fix a problem with your card before updating it.'
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
		cards.updateCard($scope.card).success(function() {
			var alertPopup = $ionicPopup.alert({
				title: 'Card Updated',
				template: 'Your card has been successfully updated.'
			});
			$ionicHistory.goBack(-1);
		}).error(function(err) {
			var alertPopup = $ionicPopup.alert({
				title: 'Uh Oh!',
				template: 'Something went wrong when updating your card.'
			});
		}).finally(function($ionicLoading) {
			$scope.hide($ionicLoading);
		});
	};
	
	// UPDATE CARD END
	
	$scope.showDeleteCard = function() {
		var confirmPopup = $ionicPopup.confirm({
			title: 'Delete Card',
			template: 'Are you sure you want to delete this card?'
		});

		confirmPopup.then(function(res) {
			if(res) {
				$scope.show($ionicLoading);
				cards.deleteCard($scope.card._id).success(function() {
					var alertPopup = $ionicPopup.alert({
						title: 'Success',
						template: 'The card was deleted successfully.'
					});
					$ionicHistory.goBack(-1);
				}).error(function() {
					var alertPopup = $ionicPopup.alert({
						title: 'Uh Oh!',
						template: 'Something went wrong when deleting the card.'
					});
				}).finally(function($ionicLoading) {
					$scope.hide($ionicLoading);
				});
			} else {
				console.log('You are not sure');
			}
		});
	};
	
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
			        	  $scope.editMode = false;
			        	  $ionicHistory.goBack(-1);
			          }
		});
	};

	//CARD END
}])