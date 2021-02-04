angular.module('App').controller('SearchCtrl', [
'$rootScope',
'$scope',
'$state',
'$ionicLoading',
'$ionicModal',
'auth',
'Misc',
'users',
'cards',
function($rootScope, $scope, $state, $ionicLoading, $ionicModal, auth, Misc, users, cards){
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
	
	$scope.currentUser = $rootScope.currentUser;
	
	//change
	$scope.searchMode = false;
	$scope.browseMode = false;
	
	$scope.users = [];
	users.getUsers().success(function(data) {
		$scope.users = users.users;
	});
	
	$scope.languages = Misc.languages();
	$scope.findLanguage = function(name) {
		return Misc.findLanguage(name);
	}
	$scope.categories = Misc.categories();
	

	$scope.profileMode = false;
	$scope.followUser = function(user) {
		users.followUser(user).success(function(){
			console.log("followed user successfully");
		})
	}
	$scope.unfollowUser = function(user) {
		users.unfollowUser(user).success(function(){
			console.log("unfollowed user successfully");
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
		$state.go('tabs.searchLanguage', { language: name });
	}
	$scope.onCategoryClick = function(name) {
		$state.go('tabs.searchCategory', { category: name });
	}
	$scope.search = function(name) {
		$state.go('tabs.searchQuery', { query: name });
	}
	
	$scope.$watch(function(newValues, oldValues){
		$('.deck').each(function(index) {
			if($scope.decks[index] && $scope.decks[index].content.cards.length != 0) var pg = $scope.decks[index].progress.cardIndex/$scope.decks[index].content.cards.length*100;
			if(pg == 0 || pg == undefined) {
				pg = 100;
				$(this).removeClass('complete');
			} else $(this).addClass('complete');
			$(this).append('<style>.deck:before{ width:'+pg+'%; }</style>');
		});
		$('.course').each(function(index) {
			if($scope.courses[index] && $scope.courses[index].content.decks.length != 0) var pg = $scope.courses[index].progress.deckIndex/$scope.courses[index].content.decks.length*100;
			if(pg == 0 || pg == undefined) {
				pg = 100;
				$(this).removeClass('complete');
			} else $(this).addClass('complete');
			$(this).append('<style>.course:before{ width:'+pg+'%; }</style>');
		});
	}, true);
	
	$scope.browseLanguage = function(name, type) {
		$scope.show($ionicLoading);
		$scope.browseMode = true;
		$scope.browseLanguageMode = true;
		$scope.browseCategoryMode = false;
		$scope.language = name;
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
			$scope.browseLanguage($scope.language, $scope.searchResultsType);
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
			$scope.browseLanguage($scope.language, $scope.searchResultsType);
		} else if($scope.searchResultsFor == "category") {
			$scope.browseCategory($scope.category, $scope.searchResultsType);
		} else if($scope.searchResultsFor == "query") {
			$scope.browseQuery($scope.query, $scope.searchResultsType);
		}
	};
	
	// SORT BY
	$scope.sortByVar = "loves";
	$scope.sortByVars = { loves: true, saves: false, newest: false};
	$ionicModal.fromTemplateUrl('views/search/search-sort-by.html', {
		scope: $scope,
		animation: 'slide-in-up'
	}).then(function(modal) {
		$scope.sortByModal = modal;
	});

	$scope.openSortBy = function() {
		$scope.sortByModal.show();
		// the selector will match all input controls of type :checkbox
		// and attach a click event handler 
		$("input:checkbox").on('click', function() {
			// in the handler, 'this' refers to the box clicked on
			var box = $(this);
			if (box.is(":checked")) {
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
			} else {
				box.prop("checked", false);
				if(box.attr('id') == "loves") {
					$scope.sortByVars.loves = false;
				} else if(box.attr('id') == "saves") {
					$scope.sortByVars.saves = false;
				} else if(box.attr('id') == "newest") {
					$scope.sortByVars.newest = false;
				}
			}
		});
	};
	
	$scope.sortBy = function() {
		$scope.sortByModal.hide();
	}
	
	// SEARCH VIEW
	$scope.searchViewVars = { card: false, preview: true, thumbnail: false};
	$ionicModal.fromTemplateUrl('views/search/search-views.html', {
		scope: $scope,
		animation: 'slide-in-up'
	}).then(function(modal) {
		$scope.searchViewModal = modal;
	});

	$scope.openSearchView = function() {
		$scope.searchViewModal.show();
		// the selector will match all input controls of type :checkbox
		// and attach a click event handler 
		$("input:checkbox").on('click', function() {
			// in the handler, 'this' refers to the box clicked on
			var box = $(this);
			if (box.is(":checked")) {
				// the name of the box is retrieved using the .attr() method
				// as it is assumed and expected to be immutable
				var group = "input:checkbox[name='" + box.attr("name") + "']";
				// the checked state of the group/box on the other hand will change
				// and the current value is retrieved using .prop() method
				$(group).prop("checked", false);
				$scope.searchViewVars.card = false;
				$scope.searchViewVars.preview = false;
				$scope.searchViewVars.thumbnail = false;
				
				box.prop("checked", true);
				if(box.attr('id') == "card") {
					$scope.searchViewVars.card = true;
				} else if(box.attr('id') == "preview") {
					$scope.searchViewVars.preview = true;
				} else if(box.attr('id') == "thumbnail") {
					$scope.searchViewVars.thumbnail = true;
				}
			} else {
				box.prop("checked", false);
				if(box.attr('id') == "card") {
					$scope.searchViewVars.card = false;
				} else if(box.attr('id') == "preview") {
					$scope.searchViewVars.preview = false;
				} else if(box.attr('id') == "thumbnail") {
					$scope.searchViewVars.thumbnail = false;
				}
			}
		});
	};
	
	$scope.searchView = function() {
		$scope.searchViewModal.hide();
	}
	
	// FILTER
	$scope.filterVars = { languages: [], categories: [], keywords: []};
	$ionicModal.fromTemplateUrl('views/search/search-filter.html', {
		scope: $scope,
		animation: 'slide-in-up'
	}).then(function(modal) {
		$scope.filterModal = modal;
	});

	$scope.openFilter = function() {
		$scope.filterModal.show();
	};
	
	$scope.filter = function() {
		$scope.filterModal.hide();
	}

	$scope.onCardClick = function(id) {
		$state.go('tabs.viewCard2', { card: id });
	}
	
	$scope.onDeckClick = function(id) {
		$state.go('tabs.viewDeck2', { deck: id });
	}
	
	$scope.onCourseClick = function(id) {
		$state.go('tabs.viewCourse2', { course: id });
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