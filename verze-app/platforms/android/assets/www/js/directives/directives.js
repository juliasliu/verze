angular.module('App').directive("card", function() {
	return {
		restrict: "E",
	  	transclude: {
			'front': 'front',
			'back': 'back'
		},
		template: "<div class='card'>" +
					"<div ng-transclude='front'></div>" +
					"<div ng-transclude='back'></div>" +
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
.directive("frontBody", function() {
	return {
		restrict: "E",
		transclude: {
			'social-buttons': 'socialButtons'
		},
		template: "<div class='item item-body card-body' ng-click='flip()' style='background-image: linear-gradient(rgba(0, 0, 0, 0.25), rgba(0, 0, 0, 0.25)), url({{ card.image }});'></div>" +
//		"<video loop muted autoplay class='background-video'>" +
//        "<source src='images/dots-clip.mov' type='video/mov'>" +
//    "</video>" +
						"<div class='card-lang' style='color: {{ card.fontcolor }};'>{{ card.frontlang }}</div>" +
						"<div ng-click='playRecording(0)' class='card-title' style='font-family: {{ card.fontstyle }}; color: {{ card.fontcolor }}; font-size: {{ card.fontsize }}px;'>{{ card.frontphrase }}</div>" +
						"<div ng-show='showCardParts.showPronun' class='card-subtitle' style='font-family: {{ card.fontstyle }}; color: {{ card.fontcolor }};'>{{ card.frontpronun }}</div>" +
						"<div ng-show='showCardParts.showExample' ng-click='playRecording(1)' class='card-example' style='font-family: {{ card.fontstyle }}; color: {{ card.fontcolor }};'>{{ card.frontexample }}</div>" +
						//"<div class='card-notes' style='font-family: {{ card.fontstyle }}; color: {{ card.fontcolor }};'>{{ card.notes }}</div>" +
					    "<div class='card-tags'>" +
					    	"<ion-scroll direction='x'>#" +
//					    		"<div ng-repeat='tag in card.tags' class='card-tag'>#{{ tag }} </div>" +
					    	"</ion-scroll>" +
					  "</div>" +
					  '<div ng-transclude="social-buttons"></div>',
		link: function(scope, elem, attr) {
			
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
.directive("backBody", function() {
	return {
		restrict: "E",
		transclude: {
			'social-buttons': 'socialButtons'
		},
		template: "<div class='item item-body card-body' ng-click='flip()' style='background-image: linear-gradient(rgba(0, 0, 0, 0.25), rgba(0, 0, 0, 0.25)), url({{ card.image }});'></div>" +
						"<div class='card-lang' style='color: {{ card.fontcolor }};'>{{ card.backlang }}</div>" +
						"<div ng-click='playRecording(2)' class='card-title' style='font-family: {{ card.fontstyle }}; color: {{ card.fontcolor }}; font-size: {{ card.fontsize }}px;'>{{ card.backphrase }}</div>" +
						"<div ng-show='showCardParts.showPronun' class='card-subtitle' style='font-family: {{ card.fontstyle }}; color: {{ card.fontcolor }};'>{{ card.backpronun }}</div>" +
						"<div ng-show='showCardParts.showExample' ng-click='playRecording(3)' class='card-example' style='font-family: {{ card.fontstyle }}; color: {{ card.fontcolor }};'>{{ card.backexample }}</div>" +
						//"<div class='card-notes' style='font-family: {{ card.fontstyle }}; color: {{ card.fontcolor }};'>{{ card.notes }}</div>" +
					    "<div class='card-tags'>" +
					    	"<ion-scroll direction='x'>#" +
//					    		"<div ng-repeat='tag in card.tags' class='card-tag'>#{{ tag }} </div>" +
					    	"</ion-scroll>" +
					  "</div>" +
					  '<div ng-transclude="social-buttons"></div>'
	};
})
.directive("cardHeader", function($ionicPopover) {
	return {
		restrict: "E",
		template: "<div class='item item-avatar'>" +
						"<img ng-src='{{ card.author.avatar }}' ng-disabled='editMode' ui-sref='tabs.me({ username: card.author.username })'>" +
						"<button class='card-options' ng-click='showCardOptions($event)' ng-disabled='editMode'><i class='ion-chevron-down'></i></button>" +
				    	"<a ng-disabled='editMode' ui-sref='tabs.me({ username: card.author.username })'><h2>@{{ card.author.username }}</h2></a>" + //<p class='card-user-caption'>{{ card.author.caption }}<p>
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
		template: "<div class='tabs social-tabs'>" +
			      		"<button class='btn card-love-btn' ng-click='loveCard()' ng-disabled='editMode || browseMode'>" +
			      			"<i class='ion-heart'></i>" +
			      			"<div class='card-social-count'>{{ card.loves }}</div>" +
			      		"</button>" +
			      		"<button class='btn' ng-click='showCardComments()' ng-disabled='editMode || browseMode'>" +
			      			"<i class='ion-chatbox'></i>" +
			      			"<div class='card-social-count'>{{ card.comments.length }}</div>" +
			      		"</button>" +
			      		"<button class='btn' ng-click='openSaveCardPopover($event)' ng-disabled='(reviewMode || editMode || browseMode) || currentUser.username == card.author.username'>" +
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
		template: "<div class='comments'>" +
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
						"<div class='comment-label'>@{{ currentUser.username }} • Just now</div>" +
						"<input type='text' class='form-control' placeholder='Write your comment here' ng-model='comment.content'></input>" +
						"<button class='btn btn-sm btn-primary' ng-show='cardComments' ng-click='addCardComment(card)'>Publish</button>" +
						"<button class='btn btn-sm btn-primary' ng-show='courseComments' ng-click='addCourseComment(course.content)'>Publish</button>" +
					"</div>" +
				  "</div>"
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

.directive("previewCard", function() {
	return {
		restrict: "E",
		template: "<div ng-hide='editMode' ng-click='onCardClick(card._id)' class='preview-card' style='background-image: linear-gradient(rgba(0, 0, 0, 0.25), rgba(0, 0, 0, 0.25)), url({{ card.image }});'>" +
					"<div class='preview-card-title' style='color: {{ card.fontcolor }}'>{{ card.frontphrase }}</div>" +
					"<div class='preview-card-subtitle' style='color: {{ card.fontcolor }}'>{{ card.frontexample }}</div>" +
				"</div>"
	}
})

.directive("thumbnailCard", function() {
	return {
		restrict: "E",
		template: "<div ng-click='onCardClick(card._id)' class='thumbnail-card' style='background-image: linear-gradient(rgba(0, 0, 0, 0.25), rgba(0, 0, 0, 0.25)), url({{ card.image }});'>" +
					"<div class='thumbnail-card-title' style='color: {{ card.fontcolor }}'>{{ card.frontphrase.substr(0, 11) }}</div>" +
				"</div>"
	}
})

.directive("thumbnailDeck", function() {
	return {
		restrict: "E",
		template: "<div class='thumbnail-deck item'>" +
					"<img ng-click='onDeckClick(deck.content._id)' class='deck-image' ng-src='{{ deck.content.image }}'>" +
					"<button class='btn mini-avatar'>" +
						"<img ng-src='{{ deck.content.author.avatar }}'>" +
					"</button>" +
//					"<div class='deck-color' style='background: {{ deck.content.color }}'></div>" +
					"<h2 class='deck-name' ng-click='onDeckClick(deck.content._id)'>{{ deck.content.name }}</h2>" +
					"<button class='btn deck-save' ng-click='openSaveDeckPopover($event)' ng-disabled='currentUser.username == deck.content.author.username'>" +
						"<i class='ion-plus-round'></i>" +
						"<p class='deck-social-count'>{{ deck.content.saved.length }}</p>" +
					"</button>" +
					"</div>"
	}
})

.directive("thumbnailCourse", function() {
	return {
		restrict: "E",
		template: "<div class='thumbnail-course item'>" +
					"<img ng-click='onCourseClick(course.content._id)' class='course-image' ng-src='{{ course.content.image }}'>" +
					"<button class='btn mini-avatar'>" +
						"<img ng-src='{{ course.content.author.avatar }}'>" +
					"</button>" +
					"<h2 class='course-name' ng-click='onCourseClick(course.content._id)'>{{ course.content.name }}</h2>" +
					"<button class='btn course-save' ng-click='openSaveCoursePopover($event)' ng-disabled='currentUser.username == course.content.author.username'>" +
						"<i class='ion-plus-round'></i>" +
						"<p class='course-social-count'>{{ course.content.saved.length }}</p>" +
					"</button>" +
					"<p class='course-num-decks'>{{ course.content.decks.length }} <i class='ion-folder'></i></p>" +
					"</div>"
	}
})

.directive("user", function() {
	return {
		restrict: "E",
	    //scope: true,
		template: "<div class='user item item-avatar' ng-hide='currentUser.username == user.username && !profileMode'>" +
						"<img ng-src='{{ user.avatar }}'>" +
						"<a ui-sref='tabs.me({ username: user.username })'><h2>@{{ user.username }}</h2></a>" +
						//"<div class=''>{{ numMutualFollowers }} mutuals</div>" +
//						"<button ng-click='followUser(user)' ng-hide='currentUser.username == user.username || currentUser.following.map(function(x) {return x._id; }).indexOf(user._id) != -1' class='btn btn-xs btn-primary btn-follow'>Follow <i class='ion-plus'></i></button>" +
//						"<button ng-click='unfollowUser(user)' ng-show=' currentUser.following.map(function(x) {return x._id; }).indexOf(user._id) != -1' class='btn btn-xs btn-default btn-follow'>Followed <i class='ion-checkmark'></i></button>" +
						"<p>{{ user.caption }}</p>" +
	        	  "</div>"/*,
	      		link: function($scope, $elem) {
	    			$scope.numMutualFollowers;
	    			
	    			for(var i = 0; i < $scope.currentUser.following.length; i++) {
	    				for(var j = 0; j < $scope.user.followers.length; j++) {
	    					if($scope.currentUser.following[i].username == $scope.user.followers[j].username) {
	    						$scope.numMutualFollowers;
	    						j += $scope.user.followers.length;
	    					}
	    				}
	    			}
	    		}*/
	}
})

.directive("thumbnailUser", function() {
	return {
		restrict: "E",
	    //scope: true,
		template: "<div class='thumbnail-user item item-avatar'>" + // ng-hide='currentUser.username == user.username && !profileMode'
						"<img ng-src='{{ user.avatar }}'>" +
						"<a ui-sref='tabs.me({ username: user.username })'><h2>@{{ user.username }}</h2></a>" +
						//"<div class='mutual-followers'>12 mutuals</div>" +
	        	  "</div>"/*,
	      		link: function($scope, $elem) {
	    			$scope.numMutualFollowers;
	    			
	    			for(var i = 0; i < $scope.currentUser.following.length; i++) {
	    				for(var j = 0; j < $scope.user.followers.length; j++) {
	    					if($scope.currentUser.following[i].username == $scope.user.followers[j].username) {
	    						$scope.numMutualFollowers;
	    						j += $scope.user.followers.length;
	    					}
	    				}
	    			}
	    		}*/
	}
})

.directive("deck", function() {
	return {
		restrict: "E",
		template: "<div class='deck item item-thumbnail-left'>" + //ng-click='showDeck(deck.content._id)'
						"<img class='deck-image' ng-src='{{ deck.content.image }}' ng-click='onDeckClick(deck.content._id)'>" +
//						"<div class='deck-color' style='background: {{ deck.content.color }}'></div>" +
						"<h2 class='deck-name' ng-click='onDeckClick(deck.content._id)'>{{ deck.content.name }}</h2>" +
						"<div class='deck-numcards'>{{ deck.content.cards.length }} card(s)</div>" +
						"<div class='deck-social-buttons social-tabs'>" +
							"<button class='btn' ng-click='openSaveDeckPopover($event)' ng-disabled='currentUser.username == deck.content.author.username'>" +
								"<i class='ion-plus-round'></i>" +
								"<p class='deck-social-count'>{{ deck.content.saved.length }}</p>" +
							"</button>" +
							"<button class='btn mini-avatar' ui-sref='tabs.me({ username: deck.content.author.username })'>" +
								"<img ng-src='{{ deck.content.author.avatar }}'>" +
//								"<p>@{{ deck.content.author.username }}</p>" +
							"</button>" +
						"</div>" +
					"</div>"
	}
})

.directive("course", function() {
	return {
		restrict: "E",
		template: "<div class='course item item-thumbnail-left'>" + // ng-click='showCourse(course.content._id)'
						"<img class='course-image' ng-src='{{ course.content.image }}' ng-click='onCourseClick(course.content._id)'>" +
						"<h2 class='course-name' ng-click='onCourseClick(course.content._id)'>{{ course.content.name }}</h2>" +
						"<p class='course-caption'>{{ course.content.caption }}</p>" +
						"<div class='course-numdecks'>{{ course.content.decks.length }} deck(s)</div>" +
						"<div class='course-social-buttons social-tabs'>" +
							"<button class='btn' ng-click='showCourseComments()' ng-disabled='true'>" +
								"<i class='ion-chatbox'></i>" +
								"<p class='course-social-count'>{{ course.content.comments.length }}</p>" +
							"</button>" +
							"<button class='btn' ng-click='saveCourse(course.content)' ng-disabled='currentUser.username == course.content.author.username'>" +
					      		"<i class='ion-plus-round'></i>" +
					      		"<p class='course-social-count'>{{ course.content.saved.length }}</p>" +
					      	"</button>" +
					      	"<button class='btn mini-avatar' ui-sref='tabs.me({ username: course.content.author.username })'>" +
					      		"<img ng-src='{{ course.content.author.avatar }}'>" +
//								"<p style='display: inline-block;'>@{{ course.content.author.username }}</p>"+
					      	"</button>" +
						"</div>" +
					"</div>"
	}
})

.directive('onFinishRender', function($timeout) {
	return {
		restrict: 'A',
		link: function (scope, element, attr) {
			if(scope.$last == true) {
				$timeout(function() {
					scope.$emit(attr.onFinishRender);
				});
			}
		}
	};
})

.filter('authoredBy', function () {
    return function (items, author) {
        //console.log(items);
        var newItems = [];
        if(items) {
        	for (var i = 0; i < items.length; i++) {
                if (items[i] && items[i].content && items[i].content.author.username === author) {
                    newItems.push(items[i]);
                }
            };
        }
        return newItems;
    }
})

.filter('DateFormat', function() {
	return function (date){
		var newDate = new Date(date);
		var monthNames = ["Jan.", "Feb.", "March", "April", "May", "June",
			                  "July", "Aug.", "Sept.", "Oct.", "Nov.", "Dec."
			                ];
		return monthNames[newDate.getMonth()] + " " + newDate.getDate() + ", " + newDate.getFullYear();
	}
})

.filter('lastReviewed', function(DateFormat) {
	return function(items, condition) {
		var filtered = [];

		angular.forEach(items, function(item) {
			var today = Math.abs(new Date(item.content.updatedAt).getTime() - new Date().getTime()) <= 86400000;
			var week = Math.abs(new Date(item.content.updatedAt).getTime() - new Date().getTime()) <= 604800000;
			var month = Math.abs(new Date(item.content.updatedAt).getTime() - new Date().getTime()) <= 2592000000;
			
			if(condition == "Today") {
				if(today){
					filtered.push(item);
				}
			} else if(condition == "Week") {
				if(week && !today){
					filtered.push(item);
				}
			} else if(condition == "Month") {
				if(month && !week && !today){
					filtered.push(item);
				}
			} else if(condition == "Older") {
				if(!month && !week && !today){
					filtered.push(item);
				}
			}
		});

		return filtered;
	};
})

.filter('sortBy', function() {
	return function(items, scope) {
		var filtered = [];
		var sortByVar = scope.sortByVar;

		if(scope.searchResultsType == "decks" || scope.searchResultsType == "courses" || scope.searchResultsType == "users") {
			if(sortByVar == "loves") sortByVar = "saves";
		}
		
		if(sortByVar == "loves") {
			if(items) items.sort(function(a,b) {return b.loves - a.loves});
		} else if(sortByVar == "saves") {
			if(items) {
				if(items[0] && items[0].saved)
					items.sort(function(a,b) {return b.saved.length - a.saved.length});
				else if(items[0] && items[0].content)
					items.sort(function(a,b) {return b.content.saved.length - a.content.saved.length});
				else if(items[0] && items[0].followers)
					items.sort(function(a,b) {return b.followers.length - a.followers.length});
			}
		} else if(sortByVar == "newest") {
			if(items) {
				if(items[0] && items[0].updatedAt)
					items.sort(function(a,b) {return new Date(b.updatedAt) - new Date(a.updatedAt)});
				else if(items[0] && items[0].content)
					items.sort(function(a,b) {return new Date(b.content.updatedAt) - new Date(a.content.updatedAt)});
			}
		}

		angular.forEach(items, function(item) {
			filtered.push(item);
		});
		return filtered;
	};
})

.directive('prettySubmit', function () {
    return function (scope, element, attr) {
        var textFields = $(element).children('input');

        $(element).submit(function(event) {
            event.preventDefault();                
            textFields.blur();
        });
    };
});