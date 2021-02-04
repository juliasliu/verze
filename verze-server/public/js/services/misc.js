angular.module('App').factory('Misc', ['cards', function(cards) {
	function getLanguages() {
		return [
		        {name: "Chinese", abbrev: "CH", image: "images/flag-china.png", caption: ""},
		        {name: "English", abbrev: "EN", image: "images/flag-america.png", caption: ""},
		        {name: "French", abbrev: "FR", image: "images/flag-france.png", caption: ""},
		        {name: "German", abbrev: "GR", image: "images/flag-germany.png", caption: ""},
		        //{name: "Hebrew", abbrev: "CH", image: "images/flag-israel.png", caption: ""},
		        {name: "Hindi", abbrev: "HD", image: "images/flag-india.png", caption: ""},
		        {name: "Italian", abbrev: "IT", image: "images/flag-italy.png", caption: ""},
		        {name: "Japanese", abbrev: "JP", image: "images/flag-japan.png", caption: ""},
		        {name: "Korean", abbrev: "KR", image: "images/flag-korea.png", caption: ""},
		        {name: "Russian", abbrev: "RS", image: "images/flag-russia.png", caption: ""},
		        {name: "Spanish", abbrev: "ES", image: "images/flag-mexico.png", caption: ""}
		        ];
	}
	
	function findLanguage(name, abbrev) {
		var languages = getLanguages();
		if(name) {
			for(var i = 0; i < languages.length; i++) {
				if(languages[i].name == name) return languages[i];
			}
		} else if(abbrev) {
			for(var i = 0; i < languages.length; i++) {
				if(languages[i].abbrev.toLowerCase() == abbrev.toLowerCase()) return languages[i];
			}
		}
	}
	
	function findCategory(name) {
		var categories = getCategories();
		for(var i = 0; i < categories.length; i++) {
			if(categories[i].name == name) return categories[i];
		}
	}
	
	function findColor(code) {
		var colors = getColors();
		for(var i = 0; i < colors.length; i++) {
			if(colors[i].code == code) return colors[i];
		}
	}
	// returns the image blob of the corresponding color code
	function getColor(code) {
		var colors = getColors();
		for(var i = 0; i < colors.length; i++) {
			if(colors[i].code == code) return cards.getFile(colors[i].id);
		}
	}
	
//	function findColorFromImage(image) {
//		var colors = getColors();
//		for(var i = 0; i < colors.length; i++) {
//			if(colors[i].image == image) return colors[i];
//		}
//	}
	
	// returns true if b > a
	function compareDifficulty(a, b) {
		var oldLang = assignDifficulty(a);
		var newLang = assignDifficulty(b);
		return newLang > oldLang;
	}

	function assignDifficulty(a) {
		if(a == "Beginner") {
			return 1;
		} else if(a == "Basic") {
			return 2;
		} else if(a == "Intermediate") {
			return 3;
		} else if(a == "Advanced") {
			return 4;
		} else if(a == "Professional") {
			return 5;
		}
	}
	
	function getExpLevels() {
		return [
			{ level: 1, points: 10 },
			{ level: 2, points: 25 },
			{ level: 3, points: 50 },
			{ level: 4, points: 100 },
			{ level: 5, points: 500 },
			{ level: 6, points: 1000 },
			{ level: 7, points: 2500 },
			{ level: 8, points: 5000 },
			{ level: 9, points: 10000 },
			{ level: 10, points: 50000 }
		];
	}
	
	function assignLevel(exp) {
		var levels = getExpLevels();
		var i = 0;
		while(i < levels.length && levels[i].points < exp) {
			i++;
		}
		return { level: levels[i].level, leftover: (exp/levels[i].points)*100 };
	}
	
	function getCountries() {
		return [
		        {name: "Algeria"},
		        {name: "Angola"},
		        {name: "Argentina"},
		        {name: "Australia"},
		        {name: "Austria"},
		        {name: "Azerbaijan"},
		        {name: "Bahrain"},
		        {name: "Bangladesh"},
		        {name: "Belarus"},
		        {name: "Belgium"},
		        {name: "Bolivia"},
		        {name: "Brazil"},
		        {name: "Bulgaria"},
		        {name: "Cameroon"},
		        {name: "Canada"},
		        {name: "Chile"},
		        {name: "China"},
		        {name: "Colombia"},
		        {name: "Costa Rica"},
		        {name: "Croatia"},
		        {name: "Czech Republic"},
		        {name: "Democratic Republic of the Congo"},
		        {name: "Denmark"},
		        {name: "Dominican Republic"},
		        {name: "Ecuador"},
		        {name: "Egypt"},
		        {name: "El Salvador"},
		        {name: "Ethiopia"},
		        {name: "Finland"},
		        {name: "France"},
		        {name: "Germany"},
		        {name: "Ghana"},
		        {name: "Greece"},
		        {name: "Guatemala"},
		        {name: "Hong Kong"},
		        {name: "Hungary"},
		        {name: "India"},
		        {name: "Indonesia"},
		        {name: "Iran"},
		        {name: "Iraq"},
		        {name: "Ireland"},
		        {name: "Israel"},
		        {name: "Italy"},
		        {name: "Japan"},
		        {name: "Jordan"},
		        {name: "Kazakhstan"},
		        {name: "Kenya"},
		        {name: "Kuwait"},
		        {name: "Latvia"},
		        {name: "Lebanon"},
		        {name: "Libya"},
		        {name: "Lithuania"},
		        {name: "Luxembourg"},
		        {name: "Malaysia"},
		        {name: "Mexico"},
		        {name: "Morocco"},
		        {name: "Myanmar"},
		        {name: "Netherlands"},
		        {name: "New Zealand"},
		        {name: "Nigeria"},
		        {name: "Norway"},
		        {name: "Oman"},
		        {name: "Pakistan"},
		        {name: "Panama"},
		        {name: "Peru"},
		        {name: "Philippines"},
		        {name: "Poland"},
		        {name: "Portugal"},
		        {name: "Puerto Rico"},
		        {name: "Qatar"},
		        {name: "Romania"},
		        {name: "Russia"},
		        {name: "Saudi Arabia"},
		        {name: "Serbia"},
		        {name: "Singapore"},
		        {name: "Slovak Republic"},
		        {name: "Slovenia"},
		        {name: "South Africa"},
		        {name: "South Korea"},
		        {name: "Spain"},
		        {name: "Sri Lanka"},
		        {name: "Sudan"},
		        {name: "Sweden"},
		        {name: "Switzerland"},
		        {name: "Syria"},
		        {name: "Taiwan"},
		        {name: "Tanzania"},
		        {name: "Thailand"},
		        {name: "Tunisia"},
		        {name: "Turkey"},
		        {name: "Turkmenistan"},
		        {name: "Ukraine"},
		        {name: "United Arab Emirates"},
		        {name: "United Kingdom"},
		        {name: "United States"},
		        {name: "Uruguay"},
		        {name: "Uzbekistan"},
		        {name: "Venezuela"},
		        {name: "Vietnam"},
		        {name: "Yemen"}
		        ];
	}
	
	function getCategories() {
		return [
                {name: "Greetings", image: "images/category-thumbnail-greetings.png"},
                {name: "Quotes", image: "images/category-thumbnail-quotes.png"},
                {name: "Formalities", image: "images/category-thumbnail-formalities.png"},
                {name: "Emotions", image: "images/category-thumbnail-emotions.png"},
                {name: "Art", image: "images/category-thumbnail-art.png"},
                {name: "Literature", image: "images/category-thumbnail-literature.png"},
                {name: "Geography", image: "images/category-thumbnail-geography.jpg"},
                {name: "History", image: "images/category-thumbnail-history.jpg"},
                {name: "Science", image: "images/category-thumbnail-science.jpg"},
                {name: "Business", image: "images/category-thumbnail-business.jpg"},
                {name: "Politics", image: "images/category-thumbnail-politics.jpg"},
                {name: "Entertainment", image: "images/category-thumbnail-entertainment.jpg"},
                {name: "Food", image: "images/category-thumbnail-food.jpg"},
                {name: "Animals", image: "images/category-thumbnail-animals.jpg"},
                {name: "Trivia", image: "images/category-thumbnail-trivia.jpg"}
                ];
	}
	
	function getLevels() {
		return [
                {name: "Beginner"},
                {name: "Basic"},
                {name: "Intermediate"},
                {name: "Advanced"},
                {name: "Professional"}
                ];
	}
	
	function getColors() {
		return [
            {name: "White", code:"FFFFFF", image: "images/color-FFFFFF.png", id: "5b1711485d4991e15f09ce13"},
            {name: "Silver", code:"C0C0C0", image: "images/color-C0C0C0.png", id: "5b1710585d4991e15f09cdef"},
            {name: "Gray", code:"808080", image: "images/color-808080.png", id: "5b1710225d4991e15f09cde6"},
            {name: "Black", code:"000000", image: "images/color-000000.png", id: "5b170aa65d4991e15f09cd4a"},
            {name: "Red", code:"FF0000", image: "images/color-FF0000.png", id: "5b1710ab5d4991e15f09cdf8"},
            {name: "Maroon", code:"800000", image: "images/color-800000.png", id: "5b170f415d4991e15f09cdc5"},
            {name: "Yellow", code:"FFFF00", image: "images/color-FFFF00.png", id: "5b1711135d4991e15f09ce0a"},
            {name: "Olive", code:"808000", image: "images/color-808000.png", id: "5b170fd55d4991e15f09cdd7"},
            {name: "Lime", code:"00FF00", image: "images/color-00FF00.png", id: "5b170c0f5d4991e15f09cd62"},
            {name: "Green", code:"008000", image: "images/color-008000.png", id: "5b170e705d4991e15f09cdad"},
            {name: "Aqua", code:"00FFFF", image: "images/color-00FFFF.png", id: "5b170c705d4991e15f09cd6b"},
            {name: "Teal", code:"008080", image: "images/color-008080.png", id: "5b170ed15d4991e15f09cdbc"},
            {name: "Blue", code:"0000FF", image: "images/color-0000FF.png", id: "5b170b4b5d4991e15f09cd59"},
            {name: "Navy", code:"000080", image: "images/color-000080.png", id: "5b170d2b5d4991e15f09cd86"},
            {name: "Fuchsia", code:"FF00FF", image: "images/color-FF00FF.png", id: "5b1710e25d4991e15f09ce01"},
            {name: "Purple", code:"800080", image: "images/color-800080.png", id: "5b170fa35d4991e15f09cdce"}
            ];
	}
	return {
		languages: getLanguages,
		findLanguage: findLanguage,
		findCategory: findCategory,
		findColor: findColor,
		getColor: getColor,
//		findColorFromImage: findColorFromImage,
		compareDifficulty: compareDifficulty,
		getDifficultyValue: assignDifficulty,
		getLevel: assignLevel,
		countries: getCountries,
		categories: getCategories,
		levels: getLevels,
		colors: getColors
	}
}])