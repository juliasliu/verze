angular.module('App').filter('authoredBy', function () {
    return function (items, author) {
        //console.log(items);
        var newItems = [];
        if(items) {
        	for (var i = 0; i < items.length; i++) {
                if (items[i] && items[i].content && items[i].content.author && items[i].content.author.username === author) {
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
			var today = Math.abs(new Date(item.progress.updatedAt).getTime() - new Date().getTime()) <= 86400000;
			var week = Math.abs(new Date(item.progress.updatedAt).getTime() - new Date().getTime()) <= 604800000;
			var month = Math.abs(new Date(item.progress.updatedAt).getTime() - new Date().getTime()) <= 2592000000;
			
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

.filter('shuffle', function() {
	return function (array) {
        //console.log(items);
		if(array) {
			var currentIndex = array.length, temporaryValue, randomIndex;

			while (0 !== currentIndex) {

				randomIndex = Math.floor(Math.random() * currentIndex);
				currentIndex -= 1;

				temporaryValue = array[currentIndex];
				array[currentIndex] = array[randomIndex];
				array[randomIndex] = temporaryValue;
			}
		}
        return array;
    }
})