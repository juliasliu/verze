angular.module('App').factory('TimeFormat', function() {
	
	function formatTime(time) {
		return truncateTime(time/1000);
	}
	
	function truncateTime(time) {
		return time.toFixed(2);
	}
	
	return {
		formatTime: formatTime,
		truncateTime: truncateTime
	}
})

.factory('DateFormat', function() {
	return {
		formatDate: function(date) {
			var newDate = new Date(date);
			var monthNames = ["Jan.", "Feb.", "Mar.", "Apr.", "May", "Jun.",
			                  "Jul.", "Aug.", "Sep.", "Oct.", "Nov.", "Dec."
			                ];
			return monthNames[newDate.getMonth()] + " " + newDate.getDate() + ", " + newDate.getFullYear();
		}
	}
})

.factory('LanguageFormat', ['Language', function(Language) {
	return {
		updateLang: function(input){
			Language.getLanguage();
			var language = Language.language();
			return language[input];
		}
	}
}])