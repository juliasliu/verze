angular.module('App').factory('BadFilter', function() {
	return {
		containBadWords: function(text) {
			var filterWords = ["fuck", "shit", "ass", "bitch", "faggot", "whore", "bastard"];
			var rgx = new RegExp(filterWords.join("|"), "gi");
			
			return text != text.replace(rgx, "****");
//			return false;
		}
	}
})

.factory('ContentCheck', ['BadFilter', function(BadFilter){
	function isCardValid(card) {
		return !(!card.frontlang || card.frontlang === ''
			|| !card.frontphrase || card.frontphrase === ''
//			|| !card.frontpronun || card.frontpronun === ''
			|| !card.backlang || card.backlang === ''
			|| !card.backphrase || card.backphrase === ''
//			|| !card.backpronun || card.backpronun === ''
//			|| !card.recordingFiles || !card.recordingFiles[0] || !card.recordingFiles[2]
			|| !card.image || card.image == "images/mexico-city-gif.gif"
			|| !card.categories
//			|| !card.tags || card.tags.length == 0
			|| !card.deck
			|| !card.fontstyle || !card.fontsize);
	}
	function isDeckValid(deck, editMode) {
		if(editMode) {
			return !(!deck.content.name || deck.content.name === ''
				|| !deck.content.lang1 || !deck.content.lang2
				|| !deck.content.categories || !deck.content.course
				|| !deck.content.image);
		} else {
			return !(!deck.name || deck.name === ''
				|| !deck.lang1 || !deck.lang2
				|| !deck.categories || !deck.course
				|| !deck.image);
		}
	}
	function isCourseValid(course, editMode) {
		if(editMode) {
			return !(!course.content.name || course.content.name === ''
				|| !course.content.caption || !course.content.lang1
				|| !course.content.lang2 || !course.content.categories
				|| !course.content.difficulty || !course.content.image);
		} else {
			return !(!course.name || course.name === ''
				|| !course.caption || !course.lang1
				|| !course.lang2 || !course.categories
				|| !course.difficulty || !course.image);
		}
	}
	function isMetacardValid(metacard, editMode) {
		return !(!metacard.notes || metacard.notes === ''
				|| (!metacard.deck && !metacard.course)
				|| (metacard.deck=="null" && metacard.course=="null")
				|| (!test.order));
	}
	function isTestValid(test, editMode) {
		return !(!test.content || test.content === ''
				|| (!test.deck && !test.course)
				|| (test.deck=="null" && test.course=="null")
				|| (!test.format)
				|| (test.content.match(/<li class="test-question/g) || []).length == 0);
	}
	function isCardFiltered(card) {
		return !(BadFilter.containBadWords(card.frontphrase) ||
				BadFilter.containBadWords(card.frontpronun) ||
				BadFilter.containBadWords(card.frontexample) ||
				BadFilter.containBadWords(card.backphrase) ||
				BadFilter.containBadWords(card.backpronun) ||
				BadFilter.containBadWords(card.backexample));
	}
	function isDeckFiltered(deck, editMode) {
		if(editMode) {
			return !(BadFilter.containBadWords(deck.content.name));
		} else {
			return !(BadFilter.containBadWords(deck.name));
		}
	}
	function isCourseFiltered(course, editMode) {
		if(editMode) {
			return !(BadFilter.containBadWords(course.content.name) ||
					BadFilter.containBadWords(course.content.caption));
		} else {
			return !(BadFilter.containBadWords(course.name) ||
					BadFilter.containBadWords(course.caption));
		}
	}
	function isTestFiltered(test, editMode) {
		return !(BadFilter.containBadWords(test.content));
	}
	return {
		isCardValid: isCardValid,
		isDeckValid: isDeckValid,
		isCourseValid: isCourseValid,
		isTestValid: isTestValid,
		isCardFiltered: isCardFiltered,
		isDeckFiltered: isDeckFiltered,
		isCourseFiltered: isCourseFiltered,
		isTestFiltered: isTestFiltered
	}
}])