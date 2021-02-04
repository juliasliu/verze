angular.module('App').directive("card", function() {
	return {
		restrict: "E",
	  	transclude: {
			'front-body': 'frontBody',
			'back-body': 'backBody'
		},
		template: "<div class='card'>" +
					"<div ng-transclude='front-body'></div>" +
					"<div ng-transclude='back-body'></div>" +
				  "</div>",
		link: function($scope, $elem) {
			$scope.flip = function() {
				$elem.toggleClass('flip');
			}
		}
	};
})
.directive("front", function() {
	return {
		restrict: "E",
		transclude: {
			'card-header': 'cardHeader',
			'front-body': 'frontBody'
//			'comments': 'comments'
		},
		template: '<div ng-transclude="card-header"></div>' +
			        '<div ng-transclude="front-body"></div>'
//			        '<div ng-transclude="comments"></div>'
	};
})
.directive("frontBody", function($ionicPopover) {
	return {
		restrict: "E",
		transclude: {
			'social-buttons': 'socialButtons'
		},
		template: "<div class='item item-body card-body' ng-click='flip()' ng-mouseover='hoverCard(true)' ng-mouseout='hoverCard(false)' style='background-image: linear-gradient(rgba(0, 0, 0, 0.25), rgba(0, 0, 0, 0.25)), url({{ card.image }});'></div>" +
//		"<video loop muted autoplay class='background-video'>" +
//        "<source src='images/dots-clip.mov' type='video/mov'>" +
//    "</video>" +
						"<div ng-show='showCardParts.showHover' class='card-lang animated fadeIn' style='color: {{ card.fontcolor }};'>{{ updateLang(card.frontlang) }}</div>" +
						"<div ng-show='showCardParts.showHover' class='card-user animated fadeIn'>" +
							"<img ng-src='{{ card.author.avatar }}' ng-disabled='editMode' ui-sref='me({ username: card.author.username })'>" +
					    	"<a ng-disabled='editMode' ui-sref='me({ username: card.author.username })'>@{{ card.author.username }}</a>" +
							"<button class='card-options' ng-click='showCardOptions($event)' ng-disabled='editMode'><i class='ion-chevron-down'></i></button>" +
						"</div>" +
						"<div ng-show='!editMode' ng-click='playRecording(0)' class='card-title' style='font-family: {{ card.fontstyle }}; color: {{ card.fontcolor }}; font-size: {{ card.fontsize }}px; line-height: {{ card.fontsize }}px;'>{{ card.frontphrase }}</div>" +
						"<input type='text' class='card-title card-input' style='font-family: {{ card.fontstyle }}; color: {{ card.fontcolor }} !important; font-size: {{ card.fontsize }}px; line-height: {{ card.fontsize }}px;' ng-model='card.frontphrase' ng-show='editMode'/>" +
						"<div ng-show='showCardParts.showPronun && !editMode' class='card-subtitle' style='font-family: {{ card.fontstyle }}; color: {{ card.fontcolor }};'>{{ card.frontpronun }}</div>" +
						"<input type='text' class='card-subtitle card-input' style='font-family: {{ card.fontstyle }}; color: {{ card.fontcolor }} !important;' ng-model='card.frontpronun' ng-show='editMode'/>" +
						"<div ng-show='showCardParts.showExample && !editMode' ng-click='playRecording(1)' class='card-example' style='font-family: {{ card.fontstyle }}; color: {{ card.fontcolor }};'>{{ card.frontexample }}</div>" +
						"<input type='text' class='card-example card-input' style='font-family: {{ card.fontstyle }}; color: {{ card.fontcolor }} !important;' ng-model='card.frontexample' ng-show='editMode'/>" +
						//"<div class='card-notes' style='font-family: {{ card.fontstyle }}; color: {{ card.fontcolor }};'>{{ card.notes }}</div>" +
					    "<div ng-show='showCardParts.showHover' class='card-tags animated fadeIn'>" +
					    	"<ion-scroll direction='x'>" +
					    		"<div ng-repeat='tag in card.tags' class='card-tag'>#{{ tag }} </div>" +
					    	"</ion-scroll>" +
					  "</div>" +
					  '<div ng-transclude="social-buttons"></div>',
					  link: function($scope, $elem) {
						  $ionicPopover.fromTemplateUrl('views/profile/view-card/view-card-options.html', {
							  scope: $scope
						  }).then(function(popover) {
							  $scope.cardOptionsPopover = popover;
						  });
						  $scope.closeCardOptions = function() {
							  $scope.cardOptionsPopover.hide();
						  };
						  $scope.showCardOptions = function($event) {
							  $scope.cardOptionsPopover.show($event);
						  }
					  }
	};
})
.directive("back", function() {
	return {
		restrict: "E",
		transclude: {
			'card-header': 'cardHeader',
			'back-body': 'backBody'
//			'comments': 'comments'
		},
		template: '<div ng-transclude="card-header"></div>' +
			        '<div ng-transclude="back-body"></div>'
//			        '<div ng-transclude="comments"></div>'
	};
})
.directive("backBody", function($ionicPopover) {
	return {
		restrict: "E",
		transclude: {
			'social-buttons': 'socialButtons'
		},
		template: "<div class='item item-body card-body' ng-click='flip()' ng-mouseover='hoverCard(true)' ng-mouseout='hoverCard(false)' style='background-image: linear-gradient(rgba(0, 0, 0, 0.25), rgba(0, 0, 0, 0.25)), url({{ card.image }});'></div>" +
						"<div ng-show='showCardParts.showHover' class='card-lang animated fadeIn' style='color: {{ card.fontcolor }};'>{{ updateLang(card.backlang) }}</div>" +
						"<div ng-show='showCardParts.showHover' class='card-user animated fadeIn'>" +
							"<img ng-src='{{ card.author.avatar }}' ng-disabled='editMode' ui-sref='me({ username: card.author.username })'>" +
					    	"<a ng-disabled='editMode' ui-sref='me({ username: card.author.username })'>@{{ card.author.username }}</a>" +
							"<button class='card-options' ng-click='showCardOptions($event)' ng-disabled='editMode'><i class='ion-chevron-down'></i></button>" +
						"</div>" +
						"<div ng-show='!editMode' ng-click='playRecording(2)' class='card-title' style='font-family: {{ card.fontstyle }}; color: {{ card.fontcolor }}; font-size: {{ card.fontsize }}px; line-height: {{ card.fontsize }}px;'>{{ card.backphrase }}</div>" +
						"<input type='text' class='card-title card-input' style='font-family: {{ card.fontstyle }}; color: {{ card.fontcolor }} !important; font-size: {{ card.fontsize }}px; line-height: {{ card.fontsize }}px;' ng-model='card.backphrase' ng-show='editMode'/>" +
						"<div ng-show='showCardParts.showPronun && !editMode' class='card-subtitle' style='font-family: {{ card.fontstyle }}; color: {{ card.fontcolor }};'>{{ card.backpronun }}</div>" +
						"<input type='text' class='card-subtitle card-input' style='font-family: {{ card.fontstyle }}; color: {{ card.fontcolor }} !important;' ng-model='card.backpronun' ng-show='editMode'/>" +
						"<div ng-show='showCardParts.showExample && !editMode' ng-click='playRecording(3)' class='card-example' style='font-family: {{ card.fontstyle }}; color: {{ card.fontcolor }};'>{{ card.backexample }}</div>" +
						"<input type='text' class='card-example card-input' style='font-family: {{ card.fontstyle }}; color: {{ card.fontcolor }} !important;' ng-model='card.backexample' ng-show='editMode'/>" +
						//"<div class='card-notes' style='font-family: {{ card.fontstyle }}; color: {{ card.fontcolor }};'>{{ card.notes }}</div>" +
					    "<div ng-show='showCardParts.showHover' class='card-tags animated fadeIn'>" +
					    	"<ion-scroll direction='x'>" +
					    		"<div ng-repeat='tag in card.tags' class='card-tag'>#{{ tag }} </div>" +
					    	"</ion-scroll>" +
					  "</div>" +
					  '<div ng-transclude="social-buttons"></div>',
					  link: function($scope, $elem) {
						  $ionicPopover.fromTemplateUrl('views/profile/view-card/view-card-options.html', {
							  scope: $scope
						  }).then(function(popover) {
							  $scope.cardOptionsPopover = popover;
						  });
						  $scope.closeCardOptions = function() {
							  $scope.cardOptionsPopover.hide();
						  };
						  $scope.showCardOptions = function($event) {
							  $scope.cardOptionsPopover.show($event);
						  }
					  }
	};
})
.directive("cardHeader", function($ionicPopover) {
	return {
		restrict: "E",
		template: "<div class='item item-avatar' style='display: none;'>" +
						"<img ng-src='{{ card.author.avatar }}' ng-disabled='editMode' ui-sref='me({ username: card.author.username })'>" +
						"<button class='card-options' ng-click='showCardOptions($event)' ng-disabled='editMode'><i class='ion-chevron-down'></i></button>" +
				    	"<a ng-disabled='editMode' ui-sref='me({ username: card.author.username })'><h2>@{{ card.author.username }}</h2></a>" + //<p class='card-user-caption'>{{ card.author.caption }}<p>
//				    	"<div><p class='time' ng-show='editMode'>Just now</p><p class='time' ng-hide='editMode'>{{ card.createdAt | DateFormat }}</p></div>" +
				      "</div>",
//		scope: { 'toggleShowCardParts' : '&'},
		link: function($scope, $elem, $attrs) {
			$ionicPopover.fromTemplateUrl('views/profile/view-card/view-card-options.html', {
				scope: $scope
			}).then(function(popover) {
				$scope.cardOptionsPopover = popover;
			});
			$scope.closeCardOptions = function() {
				$scope.cardOptionsPopover.hide();
			};
			$scope.showCardOptions = function($event) {
				$scope.cardOptionsPopover.show($event);
//				$scope.toggleShowCardParts();
			}
		}
	};
})
.directive("socialButtons", function() {
	return {
		restrict: "E",
		template: "<div class='tabs social-tabs animated fadeIn' ng-show='showCardParts.showHover'>" +
			      		"<button class='btn card-love-btn' ng-click='loveCard()' ng-disabled='editMode || browseMode'>" +
			      			"<i class='ion-heart'></i>" +
			      			"<div class='card-social-count'>{{ card.loves }}</div>" +
			      		"</button>" +
			      		"<button class='btn' ng-click='showCardComments()' ng-disabled='editMode || browseMode'>" +
			      			"<i class='ion-chatbox'></i>" +
			      			"<div class='card-social-count'>{{ card.comments.length }}</div>" +
			      		"</button>" +
			      		"<button class='btn' ng-click='openSaveCardPopover($event)' ng-disabled='(reviewMode || editMode || browseMode)'>" +
			      			"<i class='ion-plus-round'></i>" +
			      			"<div class='card-social-count'>{{ card.saved.length }}</div>" +
			      		"</button>" +
//			      		"<button class='btn' style='font-size: 1.5em;' ng-disabled='editMode'>" +
//			      			"<i class='ion-share'></i>" +
//			      		"</button>" +
//				    	"<button class='btn' style='font-size: 1.5em;' ng-disabled='editMode'>" +
//				    		"<i class='ion-alert-circled'></i>" +
//				    	"</button>" +
				      "</div>"
	};
})
.directive("comments", function() {
	return {
		restrict: "E",
		template: "<div class='comments' ng-show='showCardParts.showComments'>" +
//					"<div class='comments-view' ng-hide='viewComments' ng-click='showComments(true)'>View Comments</div>" +
//					"<div ng-show='viewComments'>" +
//						"<div class='comments-view' ng-click='showComments(false)'>Hide Comments</div>" +
						"<ul ng-show='cardComments'>" +
							"<li ng-repeat='comment in card.comments'>" +
								"<div class='comment-bar item item-avatar'>" +
							    	"<img ng-src='{{ comment.avatar }}'>" +
							    	"<div class='comment-label'><a>@{{ comment.author }}</a> • {{ formatDate(comment.createdAt) }}</div>" +
							    	"<p>{{ comment.content }}</p>" +
							    	"<div class='comment-social-buttons'>" +
								    	"<button class='btn' style='font-size: 1em;' ng-click='loveComment(comment)'>" +
								    		"<i class='ion-heart'></i>" +
								    		"<div class='card-social-count'>{{ comment.loves }}</div>" +
								    	"</button>" +
								    	"<button class='btn item-right' style='font-size: 1em;'>" +
								    		"<i class='ion-alert-circled'></i>" +
								    	"</button>" +
							    	"</div>" +
							  	"</a>" +
							"</li>" +
						"</ul>" +
						"<ul ng-show='courseComments'>" +
							"<li ng-repeat='comment in course.content.comments'>" +
								"<div class='comment-bar item item-avatar'>" +
							    	"<img ng-src='{{ comment.avatar }}'>" +
							    	"<div class='comment-label'><a>@{{ comment.author }}</a> • {{ formatDate(comment.createdAt) }}</div>" +
							    	"<p>{{ comment.content }}</p>" +
							    	"<div class='comment-social-buttons'>" +
								    	"<button class='btn' style='font-size: 1em;' ng-click='loveComment(comment)'>" +
								    		"<i class='ion-heart'></i>" +
								    		"<div class='card-social-count'>{{ comment.loves }}</div>" +
								    	"</button>" +
								    	"<button class='btn item-right' style='font-size: 1em;'>" +
								    		"<i class='ion-alert-circled'></i>" +
								    	"</button>" +
							    	"</div>" +
							  	"</a>" +
							"</li>" +
						"</ul>" +
//					"</div>" +
					"<div class='comment-bar item item-avatar'>" +
						"<img ng-src='{{ currentUser.avatar }}'>" +
						"<div class='comment-label'>@{{ currentUser.username }} • <span class='just-now-trans'>Just now</span></div>" +
						"<input type='text' class='form-control comment-placeholder-trans' placeholder='Write your comment here' ng-model='comment.content'></input>" +
						"<button class='btn btn-sm btn-primary' ng-show='cardComments' ng-click='addCardComment(card)'><span class='publish-trans'>Publish</span></button>" +
						"<button class='btn btn-sm btn-primary' ng-show='courseComments' ng-click='addCourseComment(course.content)'>Publish</button>" +
					"</div>" +
				  "</div>",
					link: function($scope, $elem) {
						if(!$scope.language) {
							$scope.$parent.getLanguage();
							$scope.language = $scope.$parent.language;
						}
						$(document).ready(function(){
							$('.just-now-trans').text($scope.language.justNow);
							$('.comment-placeholder-trans').attr("placeholder", $scope.language.commentPlaceholder);
							$('.publish-trans').text($scope.language.publish);
						});
					}
	};
})

.directive("magic", function() {
	return {
		restrict: "E",
		template: "<div class='magic-panel' ng-show='showCardParts.showMagic'>" +
//		  			"<h4>Magic</h4>" +
//		  			"<h5>COMING SOON</h5>" +
//		  			"<ul class='card-list'>" +
//		  				"<li class='preview-card' style='margin-bottom: 0px; background-image: linear-gradient(rgba(0, 0, 0, 0.25), rgba(0, 0, 0, 0.25)), url({{ card.image }});'>" +
//							"<div class='preview-card-title' style='color: {{  }}'>{{  }}</div>" +
//							"<div class='preview-card-subtitle' style='color: {{  }}'>{{  }}</div>" +
//						"</li>" +
//		  			"</ul>" +
		  		"</div>"
	}
})

.directive("cardInDeck", function($compile) {
	return {
		restrict: "E",
	    scope: { text: '@' },
		template: "<div class='card-in-deck' id='card-1'>"
					+"<p class='card-number'>{{ cardNumber }}</p>"
					+"<div class='form-group col-xs-6'>"
						+"<input type='text' class='form-control' placeholder='Front Phrase' id='frontphrase'></input>"
					+"</div>"
					+"<div class='form-group col-xs-6'>"
						+"<input type='text' class='form-control' placeholder='Back Phrase' id='backphrase'></input>"
					+"</div>"
					+"<div class='form-group col-xs-6'>"
						+"<input type='text' class='form-control' placeholder='Front Pronunciation' id='frontpronun'></input>"
					+"</div>"
					+"<div class='form-group col-xs-6'>"
						+"<input type='text' class='form-control' placeholder='Back Pronunciation' id='backpronun'></input>"
					+"</div>"
					+"<div class='form-group col-xs-6'>"
						+"<input type='text' class='form-control' placeholder='Front Example' id='frontexample'></input>"
					+"</div>"
					+"<div class='form-group col-xs-6'>"
						+"<input type='text' class='form-control' placeholder='Back Example' id='backexample'></input>"
					+"</div>"
					+"<div class='form-group col-xs-6'>"
						+"<div class='image-upload'>"
							+"<span class='btn btn-success fileinput-button'>"
								+"<i class='glyphicon glyphicon-plus'></i>"
						       +"<span>Select image</span>"
						       +"<input id='image-file' type='file' name='file' accept='image/*'>" // custom-on-change='addImageToCardInDeck(cardNumber)'
						    +"</span>"
						+"</div>"
					+"</div>"
//					+"<div class='form-group col-xs-6'>"
//						+"<ul class='color-picker'>"
//						+"</ul>"
//					+"</div>"
					+"<div class='form-group upload-recording'>"
						+"<div class='btn btn-success fileinput-button col-xs-3'>"
				        	+"<input id='audio-file1' type='file' name='file' accept='audio/*'>" // custom-on-change='addAudioToCardInDeck(cardNumber)'
							+"<i class='glyphicon glyphicon-plus'></i>"
					        +"<span>Front phrase audio</span>"
					    +"</div>"
						+"<div class='btn btn-success fileinput-button col-xs-3'>"
				        	+"<input id='audio-file2' type='file' name='file' accept='audio/*'>" // custom-on-change='addAudioToCardInDeck(cardNumber)'
							+"<i class='glyphicon glyphicon-plus'></i>"
					        +"<span>Front example audio</span>"
					    +"</div>"
						+"<div class='btn btn-success fileinput-button col-xs-3'>"
							+"<input id='audio-file3' type='file' name='file' accept='audio/*'>" // custom-on-change='addAudioToCardInDeck(cardNumber)'
							+"<i class='glyphicon glyphicon-plus'></i>"
					        +"<span>Back phrase audio</span>"
					    +"</div>"
						+"<div class='btn btn-success fileinput-button col-xs-3'>"
				        	+"<input id='audio-file4' type='file' name='file' accept='audio/*'>" // custom-on-change='addAudioToCardInDeck(cardNumber)'
							+"<i class='glyphicon glyphicon-plus'></i>"
					        +"<span>Back example audio</span>"
					    +"</div>"
					+"</div>"
					+"<div class='form-group row'>"
						+"<button type='button' ng-click='addCardToDeck()' class='btn btn-primary btn-add-card'><i class='ion-plus'></i> Add Card</button>"
						+"<button type='button' ng-click='deleteCardFromDeck()' class='btn btn-danger btn-add-card'><i class='ion-plus'></i> Delete Card</button>"
					+"</div>"
				+"</div>",
		controller: function($scope, $element) {
			$scope.cardNumber = 1;
			$scope.addCardToDeck = function() {
				var el = $compile("<card-in-deck></card-in-deck>")($scope);
				$element.parent().append(el);
				var idName = 'card-' + (++$scope.cardNumber);
				el.find( ".card-in-deck" ).attr("id", idName);
			}
			$scope.deleteCardFromDeck = function() {
				$scope.$destroy();
                $element.remove();
			}
		}
	}
})

.directive("previewCard", function() {
	return {
		restrict: "E",
		template: "<div ng-hide='editMode' ng-click='onCardClick(card._id)' class='preview-card' style='background-image: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url({{ card.image }});'>" +
					"<div class='preview-card-title' ng-hide='searchViewVars.flipped' style='color: {{ card.fontcolor }}'>{{ card.frontphrase }}</div>" +
					"<div class='preview-card-subtitle' ng-hide='searchViewVars.flipped' style='color: {{ card.fontcolor }}'>{{ card.frontexample }}</div>" +
					"<div class='preview-card-title' ng-show='searchViewVars.flipped' style='color: {{ card.fontcolor }}'>{{ card.backphrase }}</div>" +
					"<div class='preview-card-subtitle' ng-show='searchViewVars.flipped' style='color: {{ card.fontcolor }}'>{{ card.backexample }}</div>" +
				"</div>"
	}
})

.directive("thumbnailCard", function() {
	return {
		restrict: "E",
		template: "<div ng-click='onCardClick(card._id)' class='thumbnail-card' style='background-image: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url({{ card.image }});'>" +
					"<div class='thumbnail-card-title' style='color: {{ card.fontcolor }}'>{{ card.frontphrase.substr(0, 11) }}</div>" +
				"</div>"
	}
});