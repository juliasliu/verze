angular.module('App').controller('SearchCtrl', [
'$rootScope',
'$scope',
'$state',
'$ionicLoading',
'$ionicModal',
'$ionicPopup',
'$ionicPopover',
'auth',
'Misc',
'Language',
'LanguageFormat',
'users',
'cards',
function($rootScope, $scope, $state, $ionicLoading, $ionicModal, $ionicPopup, $ionicPopover, auth, Misc, Language, LanguageFormat, users, cards){
	
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
	$scope.categories = Misc.categories();
	
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
		$('.cards-trans').text($scope.language.cards);
		$('.decks-trans').text($scope.language.decks);
		$('.courses-trans').text($scope.language.courses);
		$('.users-trans').text($scope.language.users);
		$('.views-trans').text($scope.language.views);
		$('.sort-by-trans').text($scope.language.sortBy);
	});
	
	/* COPY AND PASTE ABOVE INTO EACH CTRL */
	
	$scope.getUser = function() {
		$scope.show($ionicLoading);
		
		if(auth.getUserAll() == "false") {
			cards.getAll([true, true, true], $scope.currentUser.username, true).success(function(data) {
				$scope.myCards = cards.myCards;
				$scope.myDecks = cards.myDecks;
				$scope.myCourses = cards.myCourses;
				$scope.hide($ionicLoading);
			})
		} else {
			$scope.myCards = $scope.currentUser.cards;
			$scope.myDecks = $scope.currentUser.decks;
			$scope.myCourses = $scope.currentUser.courses;
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
	
	//change
	$scope.searchMode = false;
	$scope.browseMode = false;
	
	$scope.users = [];
	users.getUsers().success(function(data) {
		$scope.users = users.users;
	});

	$scope.profileMode = false;
	$scope.followUser = function(user) {
		users.followUser(user).success(function(){
			var alertPopup = $ionicPopup.alert({
				title: 'Okay!',
				template: 'You have successfully followed this user.'
			});
		})
	}
	$scope.unfollowUser = function(user) {
		users.unfollowUser(user).success(function(){
			var alertPopup = $ionicPopup.alert({
				title: 'Okay!',
				template: 'You have unfollowed this user.'
			});
		})
	}
	
	$scope.cancelSearch = function() {
		$scope.searchMode = false;
		$scope.query = "";
	}
	
//	$scope.search = function(query) {
//		$scope.query = query;
//		$scope.searchMode = true;
//	}
	
	$scope.onLanguageClick = function(name) {
		$state.go('searchLanguage', { language: name });
	}
	$scope.onCategoryClick = function(name) {
		$state.go('searchCategory', { category: name });
	}
	$scope.search = function(name) {
		$state.go('searchQuery', { query: name });
	}
	
	$scope.$watch(function(newValues, oldValues){
//		$('.deck').each(function(index) {
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
	
	$scope.browseLanguage = function(name, type) {
		$scope.show($ionicLoading);
		$scope.browseMode = true;
		$scope.browseLanguageMode = true;
		$scope.browseCategoryMode = false;
		$scope.languageSearched = name;
		if(!type || type == "cards") {
			cards.getCardsInLanguage(name).success(function(data) {
				$scope.cards = cards.searchCards;
			}).finally(function($ionicLoading) {
				$scope.hide($ionicLoading);
			})
		} else if(type == "decks") {
			cards.getDecksInLanguage(name).success(function(data) {
				$scope.decks = cards.searchDecks;
			}).finally(function($ionicLoading) {
				$scope.hide($ionicLoading);
			})	
		} else if(type == "courses"){
			cards.getCoursesInLanguage(name).success(function(data) {
				$scope.courses = cards.searchCourses;
			}).finally(function($ionicLoading) {
				$scope.hide($ionicLoading);
			})
		} else if(type == "users"){
			cards.getUsersInLanguage(name).success(function(data) {
				$scope.users = cards.searchUsers;
			}).finally(function($ionicLoading) {
				$scope.hide($ionicLoading);
			})
		}
	}
	
	$scope.browseCategory = function(name, type) {
		$scope.show($ionicLoading);
		$scope.browseMode = true;
		$scope.browseCategoryMode = true;
		$scope.browseLanguageMode = false;
		$scope.category = name;
		if(!type || type == "cards") {
			cards.getCardsInCategory(name).success(function(data) {
				$scope.cards = cards.searchCards;
			}).finally(function($ionicLoading) {
				$scope.hide($ionicLoading);
			})
		} else if(type=="decks") {
			cards.getDecksInCategory(name).success(function(data) {
				$scope.decks = cards.searchDecks;
			}).finally(function($ionicLoading) {
				$scope.hide($ionicLoading);
			})
		} else if(type=="courses"){
			cards.getCoursesInCategory(name).success(function(data) {
				$scope.courses = cards.searchCourses;
			}).finally(function($ionicLoading) {
				$scope.hide($ionicLoading);
			})
		}
	}
	
	$scope.browseQuery = function(name, type) {
		$scope.query = name;
		$scope.show($ionicLoading);
		$scope.browseMode = false;
		$scope.searchMode = true;
		$scope.browseCategoryMode = false;
		$scope.browseLanguageMode = false;
		if(!type || type == "cards") {
			cards.getCardsInQuery(name).success(function(data) {
				$scope.cards = cards.searchCards;
			}).finally(function($ionicLoading) {
				$scope.hide($ionicLoading);
			})
		} else if(type=="decks") {
			cards.getDecksInQuery(name).success(function(data) {
				$scope.decks = cards.searchDecks;
			}).finally(function($ionicLoading) {
				$scope.hide($ionicLoading);
			})
		} else if(type=="courses"){
			cards.getCoursesInQuery(name).success(function(data) {
				$scope.courses = cards.searchCourses;
			}).finally(function($ionicLoading) {
				$scope.hide($ionicLoading);
			})
		} else if(type=="users"){
			cards.getUsersInQuery(name).success(function(data) {
				$scope.users = cards.searchUsers;
			}).finally(function($ionicLoading) {
				$scope.hide($ionicLoading);
			})
		}
	}
	
	$scope.refreshResults = function() {
		if($scope.browseCategoryMode) {
			$scope.browseCategory($scope.category, $scope.searchResultsType);
		} else if($scope.browseLanguageMode) {
			$scope.browseLanguage($scope.languageSearched, $scope.searchResultsType);
		} else if($scope.searchMode)
			$scope.browseQuery($scope.query, $scope.searchResultsType);
		$scope.$broadcast('scroll.refreshComplete');
	};
	
	$scope.goBackToSearch = function() {
		$scope.browseMode = false;
	}
	
	$scope.template = "views/search/search-tabs-languages.html";
	$scope.switchSearchTab = function(tab) {
		$('.search-tab.active').removeClass("active");
		if(tab == "Languages") {
			$scope.template = "views/search/search-tabs-languages.html";
			$('.languages-tab').addClass("active");
		} else if(tab == "Categories") {
			$scope.template = "views/search/search-tabs-categories.html";
			$('.categories-tab').addClass("active");
		}
	};
	
	$scope.searchResultsType = "cards";
	$scope.searchTemplate = "views/search/search-results/search-cards.html";
	$scope.switchResultsTab = function(tab) {
		$('.search-results-tab.active').removeClass("active");
		if(tab == "Cards") {
			$scope.searchResultsType = "cards";
			$scope.searchTemplate = "views/search/search-results/search-cards.html";
			$('.search-results-tab.cards-tab').addClass("active");
		} else if(tab == "Decks") {
			$scope.searchResultsType = "decks";
			$scope.searchTemplate = "views/search/search-results/search-decks.html";
			$('.search-results-tab.decks-tab').addClass("active");
		} else if(tab == "Courses") {
			$scope.searchResultsType = "courses";
			$scope.searchTemplate = "views/search/search-results/search-courses.html";
			$('.search-results-tab.courses-tab').addClass("active");
		} else if(tab == "Users") {
			$scope.searchResultsType = "users";
			$scope.searchTemplate = "views/search/search-results/search-users.html";
			$('.search-results-tab.users-tab').addClass("active");
		}
		if($scope.searchResultsFor == "language") {
			$scope.browseLanguage($scope.languageSearched, $scope.searchResultsType);
		} else if($scope.searchResultsFor == "category") {
			$scope.browseCategory($scope.category, $scope.searchResultsType);
		} else if($scope.searchResultsFor == "query") {
			$scope.browseQuery($scope.query, $scope.searchResultsType);
		}
	};
	
	// SEARCH OPTIONS
	
	// SORT BY
	$scope.sortByVar = "loves"; 	//used in sortBy filter
	$scope.sortByVars = { loves: true, saves: false, newest: false};
	$ionicPopover.fromTemplateUrl('views/search/search-options/search-sort-by.html', {
		scope: $scope
	}).then(function(popover) {
		$scope.sortByPopover = popover;
	});
	$scope.openSortByPopover = function($event) {
		$scope.sortByPopover.show($event);
		
		// the selector will match all input controls of type :checkbox
		// and attach a click event handler 
		$("input:checkbox").on('click', function() {
			// in the handler, 'this' refers to the box clicked on
			var box = $(this);
			// the name of the box is retrieved using the .attr() method
			// as it is assumed and expected to be immutable
			var group = "input:checkbox[name='" + box.attr("name") + "']";
			// the checked state of the group/box on the other hand will change
			// and the current value is retrieved using .prop() method
			$(group).prop("checked", false);
			$scope.sortByVars.loves = false;
			$scope.sortByVars.saves = false;
			$scope.sortByVars.newest = false;

			box.prop("checked", true);
			if(box.attr('id') == "loves") {
				$scope.sortByVars.loves = true;
				$scope.sortByVar = "loves";
			} else if(box.attr('id') == "saves") {
				$scope.sortByVars.saves = true;
				$scope.sortByVar = "saves";
			} else if(box.attr('id') == "newest") {
				$scope.sortByVars.newest = true;
				$scope.sortByVar = "newest";
			}
		});
	}
	$scope.closeSortByPopover = function() {
		$scope.sortByPopover.hide();
	};
	
	// SEARCH VIEW
	$scope.searchViewVars = { flipped: false, card: false, preview: true, thumbnail: false };
	$ionicPopover.fromTemplateUrl('views/search/search-options/search-views.html', {
		scope: $scope
	}).then(function(popover) {
		$scope.viewsPopover = popover;
	});
	$scope.openViewsPopover = function($event) {
		$scope.viewsPopover.show($event);
		
		// the selector will match all input controls of type :checkbox
		// and attach a click event handler 
		$("input:checkbox").on('click', function() {
			// in the handler, 'this' refers to the box clicked on
			var box = $(this);

			if(box.attr('id') == "flipped") {
				if (box.is(":checked")) {
					box.prop("checked", true);
					$scope.searchViewVars.flipped = true;
				} else {
					box.prop("checked", false);
					$scope.searchViewVars.flipped = false;
				}
			} else {
				// the name of the box is retrieved using the .attr() method
				// as it is assumed and expected to be immutable
				var group = "input:checkbox[name='" + box.attr("name") + "']";
				// the checked state of the group/box on the other hand will change
				// and the current value is retrieved using .prop() method
				$(group).prop("checked", false);
				
				box.prop("checked", true);
				$scope.searchViewVars.card = false;
				$scope.searchViewVars.preview = false;
				$scope.searchViewVars.thumbnail = false;
				if(box.attr('id') == "card") {
					$scope.searchViewVars.card = true;
				} else if(box.attr('id') == "preview") {
					$scope.searchViewVars.preview = true;
				} else if(box.attr('id') == "thumbnail") {
					$scope.searchViewVars.thumbnail = true;
				}
			}
		});
	}
	$scope.closeViewsPopover = function() {
		$scope.viewsPopover.hide();
	};
	
	// FILTER
	$scope.filterVars = { languages: [], categories: [] };
	$ionicPopover.fromTemplateUrl('views/search/search-options/search-filter.html', {
		scope: $scope
	}).then(function(popover) {
		$scope.filterPopover = popover;
	});
	$scope.openFilterPopover = function($event) {
		$scope.filterPopover.show($event);
		
	}
	$scope.closeFilterPopover = function() {
		$scope.filterPopover.hide();
	};
	
	// END SEARCH OPTIONS
	
	$scope.onCardClick = function(id) {
		$state.go('viewCard', { card: id });
	}
	
	$scope.onDeckClick = function(id) {
		$state.go('viewDeck', { deck: id });
	}
	
	$scope.onCourseClick = function(id) {
		$state.go('viewCourse', { course: id });
	}
	
	if($state.params.language) {
		$scope.searchResultsFor = "language";
		$scope.browseLanguage($state.params.language);
	}
	
	if($state.params.category) {
		$scope.searchResultsFor = "category";
		$scope.browseCategory($state.params.category);
	}
	
	if($state.params.query) {
		$scope.searchResultsFor = "query";
		$scope.browseQuery($state.params.query);
	}
}])