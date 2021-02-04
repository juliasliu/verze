angular.module('App').directive("deck", function() {
	return {
		restrict: "E",
		template: "<div class='deck item item-thumbnail-left'>" + //ng-click='showDeck(deck.content._id)'
						"<img class='deck-image' ng-src='{{ deck.content.image }}' ng-click='onDeckClick(deck.content._id)'>" +
//						"<div class='deck-color' style='background: {{ deck.content.color }}'></div>" +
						"<h2 class='deck-name' ng-click='onDeckClick(deck.content._id)'>{{ deck.content.name }}</h2>" +
						"<div class='deck-numcards'>{{ deck.content.cards.length }} <span class='cards-trans'>cards</span></div>" +
						"<div class='deck-languages'>" +
							"<span>" +
								"<img class='lang-thumbnail' ng-src='{{ findLanguage(deck.content.lang1).image }}'>" +
								"<span class='lang-name' ng-hide='viewCourseMode || profileMode'>{{ updateLang(deck.content.lang1) }}</span>" +
								"<span class='lang-name' ng-show='viewCourseMode || profileMode'>{{ findLanguage(deck.content.lang1).abbrev }}</span>" +
							"</span>" +
							"<span>" +
								"<img class='lang-thumbnail' ng-src='{{ findLanguage(deck.content.lang2).image }}'>" +
								"<span class='lang-name' ng-hide='viewCourseMode || profileMode'>{{ updateLang(deck.content.lang2) }}</span>" +
								"<span class='lang-name' ng-show='viewCourseMode || profileMode'>{{ findLanguage(deck.content.lang2).abbrev }}</span>" +
							"</span>" +
						"</div>" +
						"<div class='deck-social-buttons social-tabs'>" +
							"<button class='btn' ng-click='openSaveDeckPopover($event)' ng-disabled='currentUser.username == deck.content.author.username'>" +
								"<i class='ion-plus-round'></i>" +
								"<p class='deck-social-count'>{{ deck.content.saved.length }}</p>" +
							"</button>" +
							"<button class='btn mini-avatar' ui-sref='me({ username: deck.content.author.username })'>" +
								"<img ng-src='{{ deck.content.author.avatar }}'>" +
//								"<p>@{{ deck.content.author.username }}</p>" +
							"</button>" +
						"</div>" +
					"</div>",
					link: function($scope, $elem) {
						$scope.$parent.getLanguage();
						$scope.language = $scope.$parent.language;
						$(document).ready(function(){
							$('.cards-trans').text($scope.language.cards);
						});
						
						if($scope.deck.content && $scope.deck.content.cards && $scope.deck.content.cards.length != 0) var pg = $scope.deck.progress.cardIndex/$scope.deck.content.cards.length*100;
						if(pg == 0 || pg == undefined) {
							pg = 100;
							$elem.removeClass('complete');
						} else $elem.addClass('complete');
						$elem.append('<style>.deck:before{ width:'+pg+'%; }</style>');
					}
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
