angular.module('App').factory('Language', ['$http', 'auth', function($http, auth){
	var language;
	
	function returnLanguage() {
		return language;
	}
	
	function languageName() {
		return localStorage.getItem('language');
	}
	
	function setLanguage(lang) {
		if(lang) localStorage.setItem('language', lang);
	}
	
	function getLanguage() {
		(localStorage.getItem('language') == null || localStorage.getItem('language') == "undefined") ? setLanguage('en') : false;
		$.ajax({ 
			url:  '/language/' +  localStorage.getItem('language') + '.json', 
			dataType: 'json', async: false, dataType: 'json', 
			success: function (lang) { language = lang } });
	}
	
	return {
		language: returnLanguage,
		languageName: languageName,
		setLanguage: setLanguage,
		getLanguage: getLanguage
	}
}])