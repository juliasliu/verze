angular.module('App').directive("course", function() {
	return {
		restrict: "E",
		template: "<div class='course item item-thumbnail-left'>" + // ng-click='showCourse(course.content._id)'
						"<img class='course-image' ng-src='{{ course.content.image }}' ng-click='onCourseClick(course.content._id)'>" +
						"<h2 class='course-name' ng-click='onCourseClick(course.content._id)'>{{ course.content.name }}</h2>" +
						"<p class='course-caption'>{{ course.content.caption }}</p>" +
						"<div class='course-numdecks'>{{ course.content.decks.length }} <span class='decks-trans'>decks</span></div>" +
						"<div class='course-languages'>" +
							"<span>" +
								"<img class='lang-thumbnail' ng-src='{{ findLanguage(course.content.lang1).image }}'>" +
								"<span class='lang-name'>{{ updateLang(course.content.lang1) }}</span>" +
							"</span>" +
							"<span>" +
								"<img class='lang-thumbnail' ng-src='{{ findLanguage(course.content.lang2).image }}'>" +
								"<span class='lang-name'>{{ updateLang(course.content.lang2) }}</span>" +
							"</span>" +
						"</div>" +
						"<div class='course-social-buttons social-tabs'>" +
							"<button class='btn' ng-click='showCourseComments()' ng-disabled='true'>" +
								"<i class='ion-chatbox'></i>" +
								"<p class='course-social-count'>{{ course.content.comments.length }}</p>" +
							"</button>" +
							"<button class='btn' ng-click='saveCourse(course.content)' ng-disabled='currentUser.username == course.content.author.username'>" +
					      		"<i class='ion-plus-round'></i>" +
					      		"<p class='course-social-count'>{{ course.content.saved.length }}</p>" +
					      	"</button>" +
					      	"<button class='btn mini-avatar' ui-sref='me({ username: course.content.author.username })'>" +
					      		"<img ng-src='{{ course.content.author.avatar }}'>" +
//								"<p style='display: inline-block;'>@{{ course.content.author.username }}</p>"+
					      	"</button>" +
						"</div>" +
					"</div>",
					link: function($scope, $elem) {
						$scope.$parent.getLanguage();
						$scope.language = $scope.$parent.language;
						$(document).ready(function(){
							$('.decks-trans').text($scope.language.decks);
						});
						
						if($scope.course.content.decks && $scope.course.content.decks.length != 0) var pg = $scope.course.progress.deckIndex/$scope.course.content.decks.length*100;
						if(pg == 0 || pg == undefined) {
							pg = 100;
							$elem.removeClass('complete');
						} else $elem.addClass('complete');
						$elem.append('<style>.course:before{ width:'+pg+'%; }</style>');
					}
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