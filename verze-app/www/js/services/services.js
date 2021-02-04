var myHost = "http://35.166.3.103";

angular.module('App').factory('auth', ['$http', '$window', 'FileService', function($http, $window, FileService){
	var auth = {};

	auth.currentUser = {};

	auth.saveToken = function (token){
		$window.localStorage['flapper-news-token'] = token;
	};

	auth.getToken = function (){
		return $window.localStorage['flapper-news-token'];
	};

	auth.saveUser = function (user){
		$window.localStorage['user-info'] = user;
	};

	auth.getUser = function (){
		return $window.localStorage['user-info'];
	};

	auth.isLoggedIn = function(){
		var token = auth.getToken();

		if(token){
			var payload = JSON.parse($window.atob(token.split('.')[1]));

			return payload.exp > Date.now() / 1000;
		} else {
			return false;
		}
	};

	auth.currentUsername = function(){
		if(auth.isLoggedIn()){
			var token = auth.getToken();
			var payload = JSON.parse($window.atob(token.split('.')[1]));

			return payload.username;
		}
	};

	auth.register = function(user){
		return $http.post(myHost+'/register', user).success(function(data){
			auth.saveToken(data.token);
		});
	};

	auth.whoAmI = function(username){
		return $http.get(myHost+'/users/'+ username).success(function(data){
			var blob = FileService.b64toBlob([data.avatar], "image/jpeg");
			var objUrl = URL.createObjectURL(blob);
			data.user.avatar = objUrl;
			
			auth.saveUser(data.user);
			auth.currentUser = data.user;

			return data;
		});
	};

	auth.logIn = function(user){
		return $http.post(myHost+'/login', user).error(function(err) {
			console.log(err);
		}).success(function(data){
			auth.saveToken(data.token);
		});
	};

	auth.logOut = function(){
		$window.localStorage.removeItem('flapper-news-token');
	};
	
	auth.checkPass = function(user) {
		return $http.post(myHost+'/check', {password: user.oldpassword, username: auth.currentUsername()}).success(function(data) {
			return data;
		});
	}

	auth.changePass = function(password) {
		return $http.post(myHost+'/users/'+ auth.currentUsername() + '/password', {password: password}).success(function(data) {
			console.log("successfully changed password");
		});
	};

	return auth;
}])

.factory('users', ['$http', 'auth', 'FileService', 'promiseFactory', function($http, auth, FileService, promiseFactory){
	var users = {
		users: [],
		followers: [],
		following: []
	};
	
	users.getUsers = function() {
		return $http.get(myHost+'/users/')
		.success(function(data) {
			for(var i = 0; i < data.length; i++) {
				users.getUser(data[i].username).success(function(res) {
					var index = data.map(function(x) {return x._id; }).indexOf(res.user._id);
					users.users[index] = {};
					angular.copy(res.user, users.users[index]);
				})
			}
		});
	};
	
	users.getUser = function(username) {
		return $http.get(myHost+'/users/'+username).success(function(data){
			var blob = FileService.b64toBlob([data.avatar], "image/jpeg");
			var objUrl = URL.createObjectURL(blob);
			data.user.avatar = objUrl;
			return data;
		});
	}
	
	users.followUser = function(user) {
		if(user.username) username = user.username;
		else username = user;
		return $http.put(myHost+'/users/'+username+'/follow', auth.currentUser, {
			headers: {Authorization: 'Bearer '+auth.getToken()}
		}).success(function(data){
			return data;
		})
	}
	
	users.unfollowUser = function(user) {
		return $http.put(myHost+'/users/'+user.username+'/unfollow', auth.currentUser, {
			headers: {Authorization: 'Bearer '+auth.getToken()}
		}).success(function(data){
			return data;
		})
	}

	users.changeAvatar = function(image) {
		FileService.uploadImage(image).success(function(data) {
			return $http.put(myHost+'/users/'+auth.currentUsername()+'/avatar', {image: data}, {
				headers: {Authorization: 'Bearer '+auth.getToken()}
			}).success(function(data) {
				return data;
			})
		}).error(function(err) {
			console.log(err);
		});
	}
	
	users.resetAvatar = function() {
		return $http.post(myHost+'/users/'+auth.currentUsername()+'/reset_avatar', {
			headers: {Authorization: 'Bearer '+auth.getToken()}
		}).success(function(data) {
			return data;
		}).error(function(err) {
			console.log(err);
		})
	}
	
	users.updateProfile = function(user) {
		return $http.post(myHost+'/users/'+auth.currentUsername()+'/update', user, {
			headers: {Authorization: 'Bearer '+auth.getToken()}
		}).success(function(data){
			return data;
		})
	}
	
	users.addGold = function(gold) {
		return $http.put(myHost+'/users/'+auth.currentUsername()+'/gold', {gold: gold}, {
			headers: {Authorization: 'Bearer '+auth.getToken()}
		}).success(function(data){
			return data;
		})
	}
	
	users.addBadge = function(badge) {
		return $http.post(myHost+'/users/'+auth.currentUsername()+'/badges', badge, {
			headers: {Authorization: 'Bearer '+auth.getToken()}
		}).success(function(data){
			return data;
		})
	}
	
	users.addLanguage = function(language) {
		return $http.post(myHost+'/users/'+auth.currentUsername()+'/languages', language, {
			headers: {Authorization: 'Bearer '+auth.getToken()}
		}).success(function(data){
			return data;
		})
	}
	
	users.updateLanguage = function(language) {
		return $http.post(myHost+'/users/'+auth.currentUsername()+'/languages/update', language, {
			headers: {Authorization: 'Bearer '+auth.getToken()}
		}).success(function(data){
			return data;
		})
	}
	
	return users;
}])

.factory('report', ['$http', 'auth', function($http, auth){
	var r = [];
	
	r.reportAProblem = function(problem) {
		return $http.post(myHost+'/report/'+auth.currentUsername(), problem, {
			headers: {Authorization: 'Bearer '+auth.getToken()}
		}).success(function(data){
			return data;
		});
	}
	
	return r;
}])

.factory('cards', ['$http', 'auth', 'users', 'FileService', 'promiseFactory', function($http, auth, users, FileService, promiseFactory) {
	var o = {
			cards: [],
			decks: [],
			courses: [],
			myCards: [],
			myDecks: [],
			myCourses: [],
			loved: [],
			hotPicks: [],
			classicCourses: [],
			classicDecks: [],
			currentCard: {},
			currentDeck: {},
			currentCourse: {},
			tempDeck: {},
			searchCards: [],
			searchDecks: [],
			searchCourses: [],
			searchUsers: []
	};
	
	o.getAll = function(type, user) {
		if(!user) {
			user = auth.currentUsername();
		}
		if(type == "All") {
			return $http.get(myHost+'/all/user/'+user)
			.success(function(data) {
				for(var i = 0; i < data.cards.length; i++) {
					o.getCard(data.cards[i]._id).success(function(res) {
						var index = data.cards.map(function(x) {return x._id; }).indexOf(res.card._id);
						res.card.author = res.author;
						if(user == auth.currentUsername()) {
							o.myCards[index] = {};
							angular.copy(res.card, o.myCards[index]);
						} else {
							o.cards[index] = {};
							angular.copy(res.card, o.cards[index]);
						}
					})
				}
				for(var i = 0; i < data.decks.length; i++) {
					o.getDeck(data.decks[i].content._id).success(function(res) {
						var index = data.decks.map(function(x) {return x.content._id; }).indexOf(res._id);
						res.author = res.author;
						var deck = {content: res, progress: data.decks[index].progress};
						if(user == auth.currentUsername()) {
							o.myDecks[index] = {};
							angular.copy(deck, o.myDecks[index]);
						} else {
							o.decks[index] = {};
							angular.copy(deck, o.decks[index]);
						}
					})
				}
				for(var i = 0; i < data.courses.length; i++) {
					o.getCourse(data.courses[i].content._id).success(function(res) {
						var index = data.courses.map(function(x) {return x.content._id; }).indexOf(res.course._id);
						res.course.author = res.author;
						var course = {content: res.course, progress: data.courses[index].progress};
						if(user == auth.currentUsername()) {
							o.myCourses[index] = {};
							angular.copy(course, o.myCourses[index]);
						} else {
							o.courses[index] = {};
							angular.copy(course, o.courses[index]);
						}
					})
				}
			});
		} else if(type == "Cards") {
			return $http.get(myHost+'/cards/user/'+user)
			.success(function(data){
				for(var i = 0; i < data.length; i++) {
					o.getCard(data[i]._id).success(function(res) {
						var index = data.map(function(x) {return x._id; }).indexOf(res.card._id);
						o.cards[index] = {};
						res.card.author = res.author;
						angular.copy(res.card, o.cards[index]);
					})
				}
			});
		} else if(type == "Decks") {
			return $http.get(myHost+'/decks/user/'+user)
			.success(function(data){
				for(var i = 0; i < data.length; i++) {
					o.getDeck(data[i].content._id).success(function(res) {
						var index = data.map(function(x) {return x.content._id; }).indexOf(res.deck._id);
						o.decks[index] = {};
						res.deck.author = res.author;
						var deck = {content: res.deck, progress: data.decks[index].progress};
						angular.copy(deck, o.decks[index]);
					})
				}
			});
		} else if(type == "Courses") {
			return $http.get(myHost+'/courses/user/'+user)
			.success(function(data){
				for(var i = 0; i < data.length; i++) {
					o.getCourse(data[i].content._id).success(function(res) {
						var index = data.map(function(x) {return x.content._id; }).indexOf(res.course._id);
						o.courses[index] = {};
						res.course.author = res.author;
						var course = {content: res.course, progress: data.courses[index].progress};
						angular.copy(course, o.courses[index]);
					})
				}
			});
		}
	};
	o.getEverything = function() {
		return $http.get(myHost+'/all/')
		.success(function(data) {
			return data;
		});
	}
	o.getLoved = function(user) {
		if(!user) {
			user = auth.currentUsername();
		}
		return $http.get(myHost+'/cards/user/'+user+'/loved')
		.success(function(data){
			for(var i = 0; i < data.length; i++) {
				o.getCard(data[i]._id).success(function(res) {
					var index = data.map(function(x) {return x._id; }).indexOf(res.card._id);
					o.loved[index] = {};
					res.card.author = res.author;
					angular.copy(res.card, o.loved[index]);
				})
			}
		});
	}
	
	// GET HOT PICKS
	
	o.getHotPicks = function() {
		var dfd = promiseFactory.defer();
		$http.get(myHost+'/hotpicks')
		.success(function(data) {
			if(data.length == 0) return dfd.resolve();
			for(var i = 0; i < data.length; i++) {
				var currentData = data[i];
				if(currentData.type == "course") {
					o.getCourse(currentData.Id).success(function(res) {
						var index = data.map(function(x) {return x.Id; }).indexOf(res.course._id);
						o.hotPicks[index] = {};
						res.course.author = res.author;
						var course = {content: res.course};
						angular.copy(course, o.hotPicks[index]);
						return dfd.resolve();
					})
				} else {
					o.getDeck(currentData.Id).success(function(res) {
						var index = data.map(function(x) {return x.Id; }).indexOf(res._id);
						o.hotPicks[index] = {};
						var deck = {content: res};
						deck.author = res.author;
						angular.copy(deck, o.hotPicks[index]);
						return dfd.resolve();
					})
				}
			}
		})
		return dfd.promise;
	}
	
	o.getClassicCourses = function() {
		var dfd = promiseFactory.defer();
		$http.get(myHost+'/classics/courses')
		.success(function(data) {
			if(data.length == 0) return dfd.resolve();
			for(var i = 0; i < data.length; i++) {
				o.getCourse(data[i].Id).success(function(res) {
					var index = data.map(function(x) {return x.Id; }).indexOf(res.course._id);
					o.classicCourses[index] = {};
					res.course.author = res.author;
					o.getCourseProgress(res.course._id).success(function(progress) {
						var course = {content: res.course, progress: progress};
						angular.copy(course, o.classicCourses[index]);
						return dfd.resolve();
					})
				})
			}
		})
		return dfd.promise;
	}
	
	o.getClassicDecks = function() {
		var dfd = promiseFactory.defer();
		$http.get(myHost+'/classics/decks')
		.success(function(data) {
			if(data.length == 0) return dfd.resolve();
			for(var i = 0; i < data.length; i++) {
				o.getDeck(data[i].Id).success(function(res) {
					var index = data.map(function(x) {return x.Id; }).indexOf(res._id);
					o.classicDecks[index] = {};
					res.author = res.author;
					o.getDeckProgress(res._id).success(function(progress) {
						var deck = {content: res, progress: progress};
						angular.copy(deck, o.classicDecks[index]);
						return dfd.resolve();
					})
				})
			}
		})
		return dfd.promise;
	}
	
	// CREATE STUFF
	
	o.createCard = function(card) {
		function getImage() {
			return new Promise(function(resolve, reject){
				FileService.uploadImage(card.image).success(function(res) {
					resolve(res);
				}).error(function(err) {
					resolve(err);
				});
			});
		}
		
		function getRecordings(index) {
			return new Promise(function(resolve, reject){
				if(card.recordingFiles[index]){
					FileService.uploadRecording(card.recordingFiles[index])
					.success(function(data){
						resolve(data);
					})
					.error(function (err) {
						reject(err);
					});
				} else {
					resolve();
				}
			});
		}

		var dfd = promiseFactory.defer();
		Promise.all([getImage(), getRecordings(0), getRecordings(1), getRecordings(2), getRecordings(3)]).then(function(data) {
			if(data[0]) card.image = data[0];
			if(data[1]) card.recordingFiles[0] = data[1];
			if(data[2]) card.recordingFiles[1] = data[2];
			if(data[3]) card.recordingFiles[2] = data[3];
			if(data[4]) card.recordingFiles[3] = data[4];
			if(card.deck == "null") {
				return $http.post(myHost+'/user/' + auth.currentUsername() + '/cards', card, {
					headers: {Authorization: 'Bearer '+auth.getToken()}
				}).success(function(data){
					o.cards.push(data);
					return dfd.resolve();
				}).error(function(error){
					return dfd.reject(error);
				});
			} else {
				return $http.post(myHost+'/user/' + auth.currentUsername() + '/decks/'+card.deck._id+'/cards', card, {
					headers: {Authorization: 'Bearer '+auth.getToken()}
				}).success(function(data){
					o.cards.push(data);
					return dfd.resolve();
				}).error(function(error){
					return dfd.reject(error);
				});
			}
		})
		.catch(function(err) {
			return err;
		});
		return dfd.promise;
	};
	o.createDeck = function(deck) {
		var dfd = promiseFactory.defer();
		FileService.uploadImage(deck.image).success(function(res) {
			deck.image = res;
			if(deck.course == "null") {
				$http.post(myHost+'/user/' + auth.currentUsername() + '/decks', deck, {
					headers: {Authorization: 'Bearer '+auth.getToken()}
				}).success(function(data){
					o.decks.push(data);
					return dfd.resolve();
				}).error(function(error){
					return dfd.reject(error);
				});
			} else {
				$http.post(myHost+'/user/' + auth.currentUsername() + '/courses/'+JSON.parse(deck.course)._id+'/decks', deck, {
					headers: {Authorization: 'Bearer '+auth.getToken()}
				}).success(function(data){
					o.decks.push(data);
					return dfd.resolve();
				}).error(function(error){
					return dfd.reject(error);
				});
			}
		}).error(function(error) {
			return dfd.reject(error);
		});
		return dfd.promise;
	};
	o.createCourse = function(course) {
		var dfd = promiseFactory.defer();
		FileService.uploadImage(course.image).success(function(res) {
			course.image = res;
			$http.post(myHost+'/user/' + auth.currentUsername() + '/courses', course, {
				headers: {Authorization: 'Bearer '+auth.getToken()}
			}).success(function(data){
				o.courses.push(data);
				return dfd.resolve();
			}).error(function(error){
				return dfd.reject(error);
			});
		}).error(function(error) {
			return dfd.reject(error);
		});
		return dfd.promise;
	};
	
	// SAVE CARD
	
	o.saveCard = function(card, deck) {
		var isOwner = false;
		if(auth.currentUsername() == card.author.username) {
			isOwner = true;
		}
		return $http.post(myHost+'/user/' + auth.currentUsername() + '/decks/' + deck._id + '/cards/' + card._id, auth, {
			headers: {Authorization: 'Bearer '+auth.getToken()}
		}).error(function(err){
			console.log(err);
		}).success(function(data){
			o.cards.push(data);
		});
	}
	
	// SAVE DECK
	
	o.saveDeck = function(deck, course) {
		if(course) {
			return $http.post(myHost+'/user/' + auth.currentUsername() + '/courses/' + course._id + '/decks/' + deck._id, auth, {
				headers: {Authorization: 'Bearer '+auth.getToken()}
			}).error(function(err){
				console.log(err);
			}).success(function(data){
				o.decks.push(data);
			});
		} else {
			return $http.post(myHost+'/user/' + auth.currentUsername() + '/decks/' + deck._id, auth, {
				headers: {Authorization: 'Bearer '+auth.getToken()}
			}).error(function(err){
				console.log(err);
			}).success(function(data){
				o.decks.push(data);
			});
		}
	}
	
	// SAVE COURSE
	
	o.saveCourse = function(course) {
		return $http.post(myHost+'/user/' + auth.currentUsername() + '/courses/' + course._id, auth, {
			headers: {Authorization: 'Bearer '+auth.getToken()}
		}).error(function(err){
			console.log(err);
		}).success(function(data){
			o.courses.push(data);
		});
	}
	
	// LOVE CARD

	o.loveCard = function(card) {
		return $http.put(myHost+'/user/' + auth.currentUsername() + '/cards/' + card._id + '/love', auth, {
			headers: {Authorization: 'Bearer '+auth.getToken()}
		}).error(function(err){
			console.log(err);
		}).success(function(data){
			card.loves += 1;
		});
	};
	
	// LOVE COMMENT
	
	o.loveComment = function(comment) {
		return $http.put(myHost+'/comments/'+ comment._id + '/love', auth, {
			headers: {Authorization: 'Bearer '+auth.getToken()}
		}).success(function(data){
			comment.loves += 1;
		});
	};
	
	// UNLOVE CARD
	o.unloveCard = function(card) {
		return $http.get(myHost+'/user/' + auth.currentUsername() + '/cards/' + card._id + '/unlove', {
			headers: {Authorization: 'Bearer '+auth.getToken()}
		}).error(function(err){
			console.log(err);
		}).success(function(data){
			card.loves -= 1;
		});
	}
	
	// UNSAVE CARD
	o.unsaveCard = function(card) {
		return $http.get(myHost+'/user/' + auth.currentUsername() + '/cards/' + card._id + '/unsave', {
			headers: {Authorization: 'Bearer '+auth.getToken()}
		}).error(function(err){
			console.log(err);
		}).success(function(data){
			console.log(data);
		});
	}
	
	// UNSAVE DECK
	
	o.unsaveDeck = function(deck) {
		return $http.get(myHost+'/user/' + auth.currentUsername() + '/decks/' + deck._id + '/unsave', {
			headers: {Authorization: 'Bearer '+auth.getToken()}
		}).error(function(err){
			console.log(err);
		}).success(function(data){
			console.log(data);
		});
	}
	
	// UNSAVE COURSE
	
	o.unsaveCourse = function(course) {
		return $http.get(myHost+'/user/' + auth.currentUsername() + '/courses/' + course._id + '/unsave', {
			headers: {Authorization: 'Bearer '+auth.getToken()}
		}).error(function(err){
			console.log(err);
		}).success(function(data){
			console.log(data);
		});
	}
	
	// ADD COMMENTS
	
	o.addCardComment = function(comment) {
		return $http.post(myHost+'/cards/' + comment.card._id + '/comments', comment, {
			headers: {Authorization: 'Bearer '+auth.getToken()}
		}).error(function(err){
			console.log(err);
		}).success(function(data){
			console.log("Success in adding a comment");
		});
	};
	o.addCourseComment = function(comment) {
		return $http.post(myHost+'/courses/' + comment.course._id + '/comments', comment, {
			headers: {Authorization: 'Bearer '+auth.getToken()}
		}).error(function(err){
			console.log(err);
		}).success(function(data){
			console.log("Success in adding a comment");
		});
	};
	
	// GET STUFF FROM BROWSE LANGUAGE
	
	o.getCardsInLanguage = function(language) {
		var dfd = promiseFactory.defer();
		$http.get(myHost+'/cards/language', {params: {language: language}})
		.success(function(data) {
			if(data.length == 0) return dfd.resolve();
			for(var i = 0; i < data.length; i++) {
				o.getCard(data[i]._id).success(function(res) {
					var index = data.map(function(x) {return x._id; }).indexOf(res.card._id);
					o.searchCards[index] = {};
					res.card.author = res.author;
					angular.copy(res.card, o.searchCards[index]);
					if(o.searchCards.length == data.length) return dfd.resolve();
				})
			}
		})
		return dfd.promise;
	}
	
	o.getDecksInLanguage = function(language) {
		var dfd = promiseFactory.defer();
		$http.get(myHost+'/decks/language', {params: {language: language}})
		.success(function(data) {
			if(data.length == 0) return dfd.resolve();
			for(var i = 0; i < data.length; i++) {
				o.getDeck(data[i]._id).success(function(res) {
					var index = data.map(function(x) {return x._id; }).indexOf(res.deck._id);
					o.searchDecks[index] = {};
					res.deck.author = res.author;
					o.getDeckProgress(res.deck._id).success(function(progress) {
						var deck = {content: res.deck, progress: progress};
						angular.copy(deck, o.searchDecks[index]);
						if(o.searchDecks.length == data.length) return dfd.resolve();
					})
				})
			}
		})
		return dfd.promise;
	}
	
	o.getCoursesInLanguage = function(language) {
		var dfd = promiseFactory.defer();
		$http.get(myHost+'/courses/language', {params: {language: language}})
		.success(function(data) {
			if(data.length == 0) return dfd.resolve();
			for(var i = 0; i < data.length; i++) {
				o.getCourse(data[i]._id).success(function(res) {
					var index = data.map(function(x) {return x._id; }).indexOf(res.course._id);
					o.searchCourses[index] = {};
					res.course.author = res.author;
					o.getCourseProgress(res.course._id).success(function(progress) {
						var course = {content: res.course, progress: progress};
						angular.copy(course, o.searchCourses[index]);
						if(o.searchCourses.length == data.length) return dfd.resolve();
					})
				})
			}
		})
		return dfd.promise;
	}
	
	// GET STUFF FROM BROWSE CATEGORY
	
	o.getCardsInCategory = function(category) {
		var dfd = promiseFactory.defer();
		$http.get(myHost+'/cards/category', {params: {category: category}})
		.success(function(data) {
			if(data.length == 0) return dfd.resolve();
			for(var i = 0; i < data.length; i++) {
				o.getCard(data[i]._id).success(function(res) {
					var index = data.map(function(x) {return x._id; }).indexOf(res.card._id);
					o.searchCards[index] = {};
					res.card.author = res.author;
					angular.copy(res.card, o.searchCards[index]);
					if(o.searchCards.length == data.length) return dfd.resolve();
				})
			}
		})
		return dfd.promise;
	}
	
	o.getDecksInCategory = function(category) {
		var dfd = promiseFactory.defer();
		$http.get(myHost+'/decks/category', {params: {category: category}})
		.success(function(data) {
			if(data.length == 0) return dfd.resolve();
			for(var i = 0; i < data.length; i++) {
				o.getDeck(data[i]._id).success(function(res) {
					var index = data.map(function(x) {return x._id; }).indexOf(res.deck._id);
					o.searchDecks[index] = {};
					res.deck.author = res.author;
					o.getDeckProgress(res.deck._id).success(function(progress) {
						var deck = {content: res.deck, progress: progress};
						angular.copy(deck, o.searchDecks[index]);
						if(o.searchDecks.length == data.length) return dfd.resolve();
					})
				})
			}
		})
		return dfd.promise;
	}
	
	o.getCoursesInCategory = function(category) {
		var dfd = promiseFactory.defer();
		$http.get(myHost+'/courses/category', {params: {category: category}})
		.success(function(data) {
			if(data.length == 0) return dfd.resolve();
			for(var i = 0; i < data.length; i++) {
				o.getCourse(data[i]._id).success(function(res) {
					var index = data.map(function(x) {return x._id; }).indexOf(res.course._id);
					o.searchCourses[index] = {};
					res.course.author = res.author;
					o.getCourseProgress(res.course._id).success(function(progress) {
						var course = {content: res.course, progress: progress};
						angular.copy(course, o.searchCourses[index]);
						if(o.searchCourses.length == data.length) return dfd.resolve();
					})
				})
			}
		})
		return dfd.promise;
	}
	
	// GET STUFF FROM BROWSE QUERY
	
	o.getCardsInQuery = function(query) {
		var dfd = promiseFactory.defer();
		$http.get(myHost+'/cards/query', {params: {query: query}})
		.success(function(data) {
			if(data.length == 0) return dfd.resolve();
			for(var i = 0; i < data.length; i++) {
				o.getCard(data[i]._id).success(function(res) {
					var index = data.map(function(x) {return x._id; }).indexOf(res.card._id);
					o.searchCards[index] = {};
					res.card.author = res.author;
					angular.copy(res.card, o.searchCards[index]);
					if(o.searchCards.length == data.length) return dfd.resolve();
				})
			}
		})
		return dfd.promise;
	}
	
	o.getDecksInQuery = function(query) {
		var dfd = promiseFactory.defer();
		$http.get(myHost+'/decks/query', {params: {query: query}})
		.success(function(data) {
			if(data.length == 0) return dfd.resolve();
			for(var i = 0; i < data.length; i++) {
				o.getDeck(data[i]._id).success(function(res) {
					var index = data.map(function(x) {return x._id; }).indexOf(res.deck._id);
					o.searchDecks[index] = {};
					res.deck.author = res.author;
					o.getDeckProgress(res.deck._id).success(function(progress) {
						var deck = {content: res.deck, progress: progress};
						angular.copy(deck, o.searchDecks[index]);
						if(o.searchDecks.length == data.length) return dfd.resolve();
					})
				})
			}
		})
		return dfd.promise;
	}
	
	o.getCoursesInQuery = function(query) {
		var dfd = promiseFactory.defer();
		$http.get(myHost+'/courses/query', {params: {query: query}})
		.success(function(data) {
			if(data.length == 0) return dfd.resolve();
			for(var i = 0; i < data.length; i++) {
				o.getCourse(data[i]._id).success(function(res) {
					var index = data.map(function(x) {return x._id; }).indexOf(res.course._id);
					o.searchCourses[index] = {};
					res.course.author = res.author;
					o.getCourseProgress(res.course._id).success(function(progress) {
						var course = {content: res.course, progress: progress};
						angular.copy(course, o.searchCourses[index]);
						if(o.searchCourses.length == data.length) return dfd.resolve();
					})
				})
			}
		})
		return dfd.promise;
	}
	
	o.getUsersInQuery = function(query) {
		var dfd = promiseFactory.defer();
		$http.get(myHost+'/query/users', {params: {query: query}})
		.success(function(data) {
			if(data.length == 0) return dfd.resolve();
			for(var i = 0; i < data.length; i++) {
				users.getUser(data[i].username).success(function(res) {
					var index = data.map(function(x) {return x._id; }).indexOf(res.user._id);
//					var blob = FileService.b64toBlob([res.user.avatar], "image/jpeg");
//					var objUrl = URL.createObjectURL(blob);
//					res.user.avatar = objUrl;

					o.searchUsers[index] = {};
					angular.copy(res.user, o.searchUsers[index]);
					if(o.searchUsers.length == data.length) return dfd.resolve();
				})
			}
		})
		.error(function(err) {
			return dfd.reject(err);
		})
		return dfd.promise;
	}
	
	// GET CARD
	
	o.getCard = function(id, saveCard) {
		return $http.get(myHost+'/cards/' + id)
		.error(function(error) {
			console.log(error);
		})
		.success(function(res){
			var blob = FileService.b64toBlob([res.buffer], "image/jpeg");
			var objUrl = URL.createObjectURL(blob);
			res.card.image = objUrl;
			
			if(res.recording1) {
				var blob = FileService.b64toBlob([res.recording1], "audio/mpeg");
				var objUrl = URL.createObjectURL(blob);
				res.card.recordingFiles[0] = objUrl;
			}
			if(res.recording2) {
				var blob = FileService.b64toBlob([res.recording2], "audio/mpeg");
				var objUrl = URL.createObjectURL(blob);
				res.card.recordingFiles[1] = objUrl;
			}
			if(res.recording3) {
				var blob = FileService.b64toBlob([res.recording3], "audio/mpeg");
				var objUrl = URL.createObjectURL(blob);
				res.card.recordingFiles[2] = objUrl;
			}
			if(res.recording4) {
				var blob = FileService.b64toBlob([res.recording4], "audio/mpeg");
				var objUrl = URL.createObjectURL(blob);
				res.card.recordingFiles[3] = objUrl;
			}
			
			var blob = FileService.b64toBlob([res.author.avatar], "image/jpeg");
			var objUrl = URL.createObjectURL(blob);
			res.author.avatar = objUrl;
			res.card.author = res.author;
			
			if(saveCard) angular.copy(res.card, o.currentCard);
			return res.card;
		});
	};
	
	// GET DECK
	
	o.getDeck = function(id, needProgress, needCards, saveDeck, fromCourse) {
		var dfd = promiseFactory.defer();
		$http.get(myHost+'/decks/' + id)
		.error(function(error) {
			console.log(error);
		})
		.success(function(res){
			var blob = FileService.b64toBlob([res.buffer], "image/jpeg");
			var objUrl = URL.createObjectURL(blob);
			res.deck.image = objUrl;
			
			var blob = FileService.b64toBlob([res.author.avatar], "image/jpeg");
			var objUrl = URL.createObjectURL(blob);
			res.author.avatar = objUrl;
			res.deck.author = res.author;
			if(saveDeck) {
				o.currentDeck.content = {};
				o.currentDeck.content.cards = [];
				o.currentDeck.progress = {};
				angular.copy(res.deck, o.currentDeck.content);
			} else if(fromCourse) {
				o.tempDeck.content = {};
				o.tempDeck.content.cards = [];
				o.tempDeck.progress = {};
				angular.copy(res.deck, o.tempDeck.content);
			}
			if(needProgress) {
				var deckOnlyProgress = {};
				deckOnlyProgress.content = {};
				deckOnlyProgress.progress = {};
				angular.copy(res.deck, deckOnlyProgress.content);
				o.getDeckProgress(res.deck._id).success(function(progressRes) {
					if(saveDeck) angular.copy(progressRes, o.currentDeck.progress);
					else if(fromCourse) angular.copy(progressRes, o.tempDeck.progress);
					if(res.deck.course && fromCourse) {
						var index = o.currentCourse.content.decks.map(function(x) {  return x.content._id; }).indexOf(res.deck._id);
							o.currentCourse.content.decks[index].progress = {};
							angular.copy(progressRes, o.currentCourse.content.decks[index].progress);
					} else {
						angular.copy(progressRes, deckOnlyProgress.progress);
					}
				})
				if(needCards) {
					for(var i = 0; i < res.deck.cards.length; i++) {
						o.getCard(res.deck.cards[i]._id, false).success(function(cardRes) {
							var index = res.deck.cards.map(function(x) {return x._id; }).indexOf(cardRes.card._id);
							if(saveDeck) angular.copy(cardRes.card, o.currentDeck.content.cards[index]);
							else if(fromCourse) angular.copy(cardRes.card, o.tempDeck.content.cards[index]);
//							return res.deck;
							if((saveDeck && checkIfCardsDone(o.currentDeck.content.cards)) || fromCourse) return dfd.resolve(res.deck);
						})
					}
					if(res.deck.cards.length == 0) return dfd.resolve(res.deck);
				} else {
//					return res.deck;
					return dfd.resolve(deckOnlyProgress);
				}
			} else {
//				return res.deck;
				return dfd.resolve(res.deck);
			}			
		});
		return dfd.promise;
	};
	
	var checkIfCardsDone = function(cards) {
		for(var i = 0; i < cards.length; i++) {
			if(!cards[0].author.username) return false;
		}
		return true;
	}
	
	// GET COURSE
	
	o.getCourse = function(id, needProgress, needDecks, saveCourse) {
		return $http.get(myHost+'/courses/' + id)
		.error(function(error) {
			console.log(error);
		})
		.success(function(res){
			var blob = FileService.b64toBlob([res.buffer], "image/jpeg");
			var objUrl = URL.createObjectURL(blob);
			res.course.image = objUrl;
			
			var blob = FileService.b64toBlob([res.author.avatar], "image/jpeg");
			var objUrl = URL.createObjectURL(blob);
			res.author.avatar = objUrl;
			res.course.author = res.author;
			res.course.comments = res.comments;
			res.course.metacards = res.metacards;
			if(saveCourse) {
				o.currentCourse.content = {};
				o.currentCourse.content.decks = [];
				o.currentCourse.progress = {};
				angular.copy(res.course, o.currentCourse.content);
			}
			if(needProgress) {
				var courseOnlyProgress = {};
				courseOnlyProgress.content = {};
				courseOnlyProgress.progress = {};
				angular.copy(res.course, courseOnlyProgress.content);
				o.getCourseProgress(res.course._id).success(function(progressRes) {
					if(saveCourse) angular.copy(progressRes, o.currentCourse.progress);
					else angular.copy(progressRes, courseOnlyProgress.progress);
				})
				if(needDecks) {
					for(var i = 0; i < res.course.decks.length; i++) {
						o.getDeck(res.course.decks[i]._id, true, false, false, true).success(function(deckRes) {
							var index = res.course.decks.map(function(x) {return x._id; }).indexOf(deckRes.content._id);
							if(saveCourse){
								o.currentCourse.content.decks[index] = { content: {}, progress: {}};
								o.currentCourse.content.decks[index].content = o.tempDeck.content;
								o.currentCourse.content.decks[index].progress = o.tempDeck.progress;
							}
						})
					}
				} else return courseOnlyProgress;
			} else return res.course;
		});
	};
	
	// GET FILE
	
	o.getFile = function(id) {
		return $http.get('/files/' + id, {responseType: "arraybuffer"}).success(function(data){
			return data;
		});
	};
	
	// GET PROGRESS
	
	o.getDeckProgress = function(deck) {
		return $http.get(myHost+'/user/' + auth.currentUsername() + '/decks/' + deck + '/progress/')
		.error(function(err) {
			console.log(err);
		}).success(function(data) {
			return data;
		});
	}
	o.getCourseProgress = function(course) {
		return $http.get(myHost+'/user/' + auth.currentUsername() + '/courses/' + course + '/progress/')
		.error(function(err) {
			console.log(err);
		}).success(function(data) {
			return data;
		});
	}
	
	// UPDATE PROGRESS INDEX
	
	o.updateDeckIndex = function(deck, progress, index) {
		return $http.put(myHost+'/user/' + auth.currentUsername() + '/deck/progress/' + progress._id, {index: index}, {
			headers: {Authorization: 'Bearer '+auth.getToken()}
		}).error(function(err){
			console.log(err);
		}).success(function(data){
			return data;
		});
	}
	o.updateCourseIndex = function(course, progress, index) {
		return $http.put(myHost+'/user/' + auth.currentUsername() + '/course/progress/' + progress._id, {index: index}, {
			headers: {Authorization: 'Bearer '+auth.getToken()}
		}).error(function(err){
			console.log(err);
		}).success(function(data){
			return data;
		});
	}
	
	// UPDATE CARD
	
	o.updateCard = function(card) {
		function getImage() {
			return new Promise(function(resolve, reject){
				if(card.image.substr(0, 4) == 'blob') {
					resolve(card.image);
				} else {
					FileService.uploadImage(card.image).success(function(res) {
						resolve(res);
					}).error(function(err) {
						resolve(err);
					});
				}
			});
		}
		
		function getRecordings(index) {
			return new Promise(function(resolve, reject){
				if(card.recordingFiles[index]){
					if(card.recordingFiles[index].substr(0, 4) == 'blob') {
						resolve(card.recordingFiles[index]);
					} else {
						FileService.uploadRecording(card.recordingFiles[index])
						.success(function(data){
							resolve(data);
						})
						.error(function (err) {
							reject(err);
						});
					}
				} else {
					resolve();
				}
			});
		}
		
		var dfd = promiseFactory.defer();
		Promise.all([getImage(), getRecordings(0), getRecordings(1), getRecordings(2), getRecordings(3)]).then(function(data) {
			if(data[0]) card.image = data[0];
			if(data[1]) card.recordingFiles[0] = data[1];
			if(data[2]) card.recordingFiles[1] = data[2];
			if(data[3]) card.recordingFiles[2] = data[3];
			if(data[4]) card.recordingFiles[3] = data[4];
				$http.post(myHost+'/cards/' + card._id + '/update', card, {
					headers: {Authorization: 'Bearer '+auth.getToken()}
				}).success(function(data){
					return dfd.resolve();
				}).error(function(error){
					return dfd.reject(error);
				});
		})
		.catch(function(err) {
			return err;
		});
		return dfd.promise;
	}
	
	// UPDATE DECK
	
	o.updateDeck = function(deck) {
		var dfd = promiseFactory.defer();
		if(deck.content.image.substr(0, 13) == 'blob:file:///') {
			$http.post(myHost+'/decks/' + deck.content._id + '/update', deck, {
				headers: {Authorization: 'Bearer '+auth.getToken()}
			}).success(function(data){
				return dfd.resolve();
			}).error(function(error){
				return dfd.reject(error);
			});
		} else {
			FileService.uploadImage(deck.content.image).success(function(res) {
				deck.content.image = res;
				$http.post(myHost+'/decks/' + deck.content._id + '/update', deck, {
					headers: {Authorization: 'Bearer '+auth.getToken()}
				}).success(function(data){
					return dfd.resolve();
				}).error(function(error){
					return dfd.reject(error);
				});
			}).error(function(error) {
				return dfd.reject(error);
			});
		}
		
		return dfd.promise;
	}
	
	// UPDATE COURSE
	
	o.updateCourse = function(course) {
		var dfd = promiseFactory.defer();
		if(course.content.image.substr(0, 13) == 'blob:file:///') {
			$http.post(myHost+'/courses/' + course.content._id + '/update', course, {
				headers: {Authorization: 'Bearer '+auth.getToken()}
			}).success(function(data){
				return dfd.resolve();
			}).error(function(error){
				return dfd.reject(error);
			});
		} else {
			FileService.uploadImage(course.content.image).success(function(res) {
				course.content.image = res;
				$http.post(myHost+'/courses/' + course.content._id + '/update', course, {
					headers: {Authorization: 'Bearer '+auth.getToken()}
				}).success(function(data){
					return dfd.resolve();
				}).error(function(error){
					return dfd.reject(error);
				});
			}).error(function(error) {
				return dfd.reject(error);
			});
		}
		return dfd.promise;
	}
	
	// DELETE CARD
	
	o.deleteCard = function(id) {
		return $http.get(myHost+'/cards/' + id + '/remove', {
			headers: {Authorization: 'Bearer '+auth.getToken()}
		}).error(function(error) {
			console.log(error);
		}).success(function(res){
			return res;
		});
	}
	
	// DELETE DECK
	
	o.deleteDeck = function(id) {
		return $http.get(myHost+'/decks/' + id + '/remove', {
			headers: {Authorization: 'Bearer '+auth.getToken()}
		}).error(function(error) {
			console.log(error);
		}).success(function(res){
			return res;
		});
	}
	
	// DELETE COURSE
	
	o.deleteCourse = function(id) {
		return $http.get(myHost+'/courses/' + id + '/remove', {
			headers: {Authorization: 'Bearer '+auth.getToken()}
		}).error(function(error) {
			console.log(error);
		}).success(function(res){
			return res;
		});
	}
	
	return o;
}])

.factory('promiseFactory', function($q) {
  return {
    decorate: function(promise) {
      promise.success = function(callback) {
        promise.then(callback);

        return promise;
      };

      promise.error = function(callback) {
        promise.then(null, callback);

        return promise;
      };
    },
    defer: function() {
      var deferred = $q.defer();

      this.decorate(deferred.promise);

      return deferred;
    }
  };
})

.factory('FileService', ['$cordovaFileTransfer', 'promiseFactory', function($cordovaFileTransfer, promiseFactory) {
	function uploadImage(image) {
		var url = myHost+'/uploads';
		var filePath = image;
		var fileName = image.substr(image.lastIndexOf('/') + 1);;
		
		var options = {
			fileName: fileName,
			chunkedMode: false,
			params: {'filePath': filePath, 'fileId': ""}
		}
		
		var dfd = promiseFactory.defer();
		
		$cordovaFileTransfer.upload(url, filePath, options)
		.then(function(res) {
			return dfd.resolve(JSON.parse(res.response));
		}, function(err) {
			return dfd.reject(err);
		}, function (progress) {
			// constant progress updates
		});
		return dfd.promise;
	}
	
	function uploadRecording(item, index) {
		var url = myHost+'/uploads';
		var filePath = item;
		var fileName = item.substr(item.lastIndexOf('/')+1);
		
		var options = {
			fileName: fileName,
			mimeType: "audio/m4a",
			chunkedMode: false,
			params: {'filePath': filePath, 'fileId': ""}
		}
		
		var dfd = promiseFactory.defer();
		
		$cordovaFileTransfer.upload(url, filePath, options)
		.then(function(res) {
			return dfd.resolve(JSON.parse(res.response));
		}, function(err) {
			return dfd.reject(err);
		}, function (progress) {
			// constant progress updates
		});
		return dfd.promise;
	}
	
	/**
	 * Convert a base64 string in a Blob according to the data and contentType.
	 * 
	 * @param b64Data {String} Pure base64 string without contentType
	 * @param contentType {String} the content type of the file i.e (audio/mpeg - image/png - text/plain)
	 * @param sliceSize {Int} SliceSize to process the byteCharacters
	 * @see http://stackoverflow.com/questions/16245767/creating-a-blob-from-a-base64-string-in-javascript
	 * @return Blob
	 */
	function b64toBlob(b64Data, contentType, sliceSize) {
		contentType = contentType || '';
		sliceSize = sliceSize || 512;

		var byteCharacters = atob(b64Data);
		var byteArrays = [];

		for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
			var slice = byteCharacters.slice(offset, offset + sliceSize);

			var byteNumbers = new Array(slice.length);
			for (var i = 0; i < slice.length; i++) {
				byteNumbers[i] = slice.charCodeAt(i);
			}

			var byteArray = new Uint8Array(byteNumbers);

			byteArrays.push(byteArray);
		}

		var blob = new Blob(byteArrays, {type: contentType});
		return blob;
	}
	
	/**
	 * Create an Audio file according to its database64 content only.
	 * 
	 * @param folderpath {String} The folder where the file will be created
	 * @param filename {String} The name of the file that will be created
	 * @param content {Base64 String} Important : The content can't contain the following string (data:audio/mpeg[or any other format];base64,). Only the base64 string is expected.
	 */
	function saveBase64AsAudioFile(folderpath,filename,content,contentType){
	    // Convert the base64 string in a Blob
	    var DataBlob = b64toBlob(content,contentType);

	    console.log("Starting to write the file :3");

	    window.resolveLocalFileSystemURL(folderpath, function(dir) {
	        console.log("Access to the directory granted succesfully");
	        dir.getFile(filename, {create:true}, function(file) {
	            console.log("File created succesfully.");
	            file.createWriter(function(fileWriter) {
	                console.log("Writing content to file");
	                fileWriter.write(DataBlob);
	            }, function(){
	                alert('Unable to save file in path '+ folderpath);
	            });
	        });
	    });
	}
	
	function randomFileName(name) {
		return makeid() + name;
	}
	
	function makeid() {
		var text = '';
		var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

		for (var i = 0; i < 5; i++) {
			text += possible.charAt(Math.floor(Math.random() * possible.length));
		}
		return text;
	};

	return {
		uploadImage: uploadImage,
		uploadRecording: uploadRecording,
		b64toBlob: b64toBlob,
		saveAudio: saveBase64AsAudioFile,
		randomName: randomFileName,
		makeid: makeid
	}
}])

.factory('ImageService', function($cordovaCamera, FileService, $q, $cordovaFile) {

	function optionsForType(type) {
		var source;
		switch (type) {
		case 0:
			source = Camera.PictureSourceType.CAMERA;
			break;
		case 1:
			source = Camera.PictureSourceType.PHOTOLIBRARY;
			break;
		}
		return {
			destinationType: Camera.DestinationType.FILE_URI,
			sourceType: source,
			allowEdit: false,
			encodingType: Camera.EncodingType.JPEG,
			popoverOptions: CameraPopoverOptions,
			saveToPhotoAlbum: false
		};
	}

	function saveMedia(type) {
		return $q(function(resolve, reject) {
			var options = optionsForType(type);

			$cordovaCamera.getPicture(options).then(function(imageUrl) {
				var name = imageUrl.substr(imageUrl.lastIndexOf('/') + 1);
				var namePath = imageUrl.substr(0, imageUrl.lastIndexOf('/') + 1);
				var newName = FileService.makeid() + name;
				$cordovaFile.copyFile(namePath, name, cordova.file.dataDirectory, newName)
				.then(function(info) {
					return resolve(info.nativeURL);
				}, function(e) {
					return reject(e);
				});
			});
		})
	}
	
	return {
		handleMediaDialog: saveMedia
	}
}) 

.factory('TimeFormat', function() {
	
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

.factory('BadFilter', function() {
	return {
		containBadWords: function(text) {
//			var Filter = require('lib/badwords-master/lib/badwords.js');
//			var filter = new Filter();
			
//			return filter.isProfane(text);
			return false;
		}
	}
})

.factory('Misc', function() {
	function getLanguages() {
		return [
		        {name: "Chinese", image: "images/flag-china.png", caption: ""},
		        {name: "English", image: "images/flag-america.png", caption: ""},
		        {name: "French", image: "images/flag-france.png", caption: ""},
		        {name: "German", image: "images/flag-germany.png", caption: ""},
		        //{name: "Hebrew", image: "images/flag-israel.png", caption: ""},
		        {name: "Hindi", image: "images/flag-india.png", caption: ""},
		        {name: "Italian", image: "images/flag-italy.png", caption: ""},
		        {name: "Japanese", image: "images/flag-japan.png", caption: ""},
		        {name: "Korean", image: "images/flag-korea.png", caption: ""},
		        {name: "Russian", image: "images/flag-russia.png", caption: ""},
		        {name: "Spanish", image: "images/flag-mexico.png", caption: ""}
		        ];
	}
	
	function findLanguage(name) {
		var languages = getLanguages();
		for(var i = 0; i < 10; i++) {
			if(languages[i].name == name) return languages[i];
		}
	}
	
	
	// returns true if b > a
	function compareDifficulty(a, b) {
		var oldLang = assignDifficulty(a);
		var newLang = assignDifficulty(b);
		return newLang > oldLang;
	}

	function assignDifficulty(a) {
		if(a == "Beginner") {
			return 0;
		} else if(a == "Basic") {
			return 1;
		} else if(a == "Conversational") {
			return 2;
		} else if(a == "Intermediate") {
			return 3;
		} else if(a == "Advanced") {
			return 4;
		} else if(a == "Professional") {
			return 5;
		}
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
                {name: "Conversational"},
                {name: "Intermediate"},
                {name: "Advanced"},
                {name: "Professional"}
                ];
	}
	return {
		languages: getLanguages,
		findLanguage: findLanguage,
		compareDifficulty: compareDifficulty,
		countries: getCountries,
		categories: getCategories,
		levels: getLevels
	}
});