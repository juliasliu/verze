angular.module('App').factory('cards', ['$http', 'auth', 'users', 'FileService', 'promiseFactory', function($http, auth, users, FileService, promiseFactory) {
	var o = {
			username: "",
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
			searchUsers: [],
			multipleCards: []
	};
	
	// type = [getCards, getDecks, getCourses]
	// saveAll is true if user is currentUser
	o.getAll = function(type, user, saveAll) {
		if(!user) {
			o.username = auth.currentUsername();
		} else {
			o.username = user;
		}
		var dfd = promiseFactory.defer();
			$http.get('/all/user/'+o.username)
			.success(function(data) {
				var cardCount = 0;
				var deckCount = 0;
				var courseCount = 0;
				
				function getAllCards() {
					return new Promise(function(resolve, reject){
						if(!type[0]) {
							resolve();
							return;
						}
						var notResolved = true;
						for(var i = 0; i < data.cards.length; i++) {
							o.getCard(data.cards[i]._id).success(function(res) {
								cardCount++;
								var index = data.cards.map(function(x) {return x._id; }).indexOf(res.card._id);
								res.card.author = res.author;
								if(o.username == auth.currentUsername()) {
									o.myCards[index] = {};
									angular.copy(res.card, o.myCards[index]);
								} else {
									o.cards[index] = {};
									angular.copy(res.card, o.cards[index]);
								}
								if(saveAll) {
									var userr = auth.getUser(true);
									userr.cards[index] = res.card;
									auth.saveUser(userr);
									if(cardCount == userr.cards.length) auth.saveUserAll(true);
								}
								if(cardCount >= data.cards.length/5 && notResolved) {
									notResolved = false;
									resolve();
								}
							}).error(function(err) {
								reject(err);
							})
						}
					});	
				}
				
				function getAllDecks() {
					return new Promise(function(resolve, reject) {
						if(!type[1]) {
							resolve();
							return;
						}
						var notResolved = true;
						for(var i = 0; i < data.decks.length; i++) {
							o.getDeck(data.decks[i].content._id).success(function(res) {
								deckCount++;
								var index = data.decks.map(function(x) {return x.content._id; }).indexOf(res._id);
								res.author = res.author;
								var deck = {content: res, progress: data.decks[index].progress};
								if(o.username == auth.currentUsername()) {
									o.myDecks[index] = {};
									angular.copy(deck, o.myDecks[index]);
								} else {
									o.decks[index] = {};
									angular.copy(deck, o.decks[index]);
								}
								if(saveAll) {
									var userr = auth.getUser(true);
									userr.decks[index] = deck;
									auth.saveUser(userr);
									if(deckCount == userr.decks.length) auth.saveUserAll(true);
								}
								if(deckCount >= data.decks.length && notResolved) {
									notResolved = false;
									resolve();
								}
							}).error(function(err) {
								reject(err);
							})
						}
					})
				}
				
				function getAllCourses() {
					return new Promise(function(resolve, reject) {
						if(!type[2]) {
							resolve();
							return;
						}
						var notResolved = true;
						for(var i = 0; i < data.courses.length; i++) {
							o.getCourse(data.courses[i].content._id).success(function(res) {
								courseCount++;
								var index = data.courses.map(function(x) {return x.content._id; }).indexOf(res.course._id);
								res.course.author = res.author;
								var course = {content: res.course, progress: data.courses[index].progress};
								if(o.username == auth.currentUsername()) {
									o.myCourses[index] = {};
									angular.copy(course, o.myCourses[index]);
								} else {
									o.courses[index] = {};
									angular.copy(course, o.courses[index]);
								}
								if(saveAll) {
									var userr = auth.getUser(true);
									userr.courses[index] = course;
									auth.saveUser(userr);
									if(courseCount == userr.courses.length) auth.saveUserAll(true);
								}
								if(courseCount >= data.courses.length && notResolved) {
									notResolved = false;
									resolve();
								}
							}).error(function(err) {
								reject(err);
							})
						}
					})
				}
				
				Promise.all([getAllCards(), getAllDecks(), getAllCourses()]).then(function(data) {
					return dfd.resolve();
				})
				.catch(function(err) {
					return dfd.reject(err);
				});
			});
			return dfd.promise;
//		} else if(type == "Cards") {
//			return $http.get('/cards/user/'+o.username)
//			.success(function(data){
//				for(var i = 0; i < data.length; i++) {
//					o.getCard(data[i]._id).success(function(res) {
//						var index = data.map(function(x) {return x._id; }).indexOf(res.card._id);
//						o.cards[index] = {};
//						res.card.author = res.author;
//						angular.copy(res.card, o.cards[index]);
//					})
//				}
//			});
//		} else if(type == "Decks") {
//			return $http.get('/decks/user/'+o.username)
//			.success(function(data){
//				for(var i = 0; i < data.length; i++) {
//					o.getDeck(data[i].content._id).success(function(res) {
//						var index = data.map(function(x) {return x.content._id; }).indexOf(res._id);
//						o.decks[index] = {};
//						var deck = {content: res, progress: data[index].progress};
//						angular.copy(deck, o.decks[index]);
//					})
//				}
//			});
//		} else if(type == "Courses") {
//			return $http.get('/courses/user/'+o.username)
//			.success(function(data){
//				for(var i = 0; i < data.length; i++) {
//					o.getCourse(data[i].content._id).success(function(res) {
//						var index = data.map(function(x) {return x.content._id; }).indexOf(res.course._id);
//						o.courses[index] = {};
//						res.course.author = res.author;
//						var course = {content: res.course, progress: data[index].progress};
//						angular.copy(course, o.courses[index]);
//					})
//				}
//			});
//		}
	};
	o.getEverything = function() {
		return $http.get('/all/')
		.success(function(data) {
			return data;
		});
	}
	o.getLoved = function(user) {
		if(!user) {
			user = auth.currentUsername();
		}
		return $http.get('/cards/user/'+user+'/loved')
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
		$http.get('/hotpicks')
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
		$http.get('/classics/courses')
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
		$http.get('/classics/decks')
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
	
	o.createCard = function(card, multiple) {
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
		
		function getFrontPhrase() {
			return new Promise(function(resolve, reject){
				resolve(card.frontphrase);
			});
		}

		if(multiple) {
			var cardCopy = {};
			angular.copy(card, cardCopy);
			o.multipleCards.push(cardCopy);
		}
		var dfd = promiseFactory.defer();
		Promise.all([getImage(), getRecordings(0), getRecordings(1), getRecordings(2), getRecordings(3), getFrontPhrase()]).then(function(data) {
			// find card in multipleCards array
			if(multiple) {
				var index = o.multipleCards.map(function(x) {return x.frontphrase; }).indexOf(data[5]);
				angular.copy(o.multipleCards[index], card);
			}
			if(data[0]) card.image = data[0];
			if(data[1]) card.recordingFiles[0] = data[1];
			if(data[2]) card.recordingFiles[1] = data[2];
			if(data[3]) card.recordingFiles[2] = data[3];
			if(data[4]) card.recordingFiles[3] = data[4];
			
			if(card.deck == "null") {
				return $http.post('/user/' + auth.currentUsername() + '/cards', card, {
					headers: {Authorization: 'Bearer '+auth.getToken()}
				}).success(function(data){
					o.cards.push(data);
					return dfd.resolve();
				}).error(function(error){
					return dfd.reject(error);
				});
			} else {
				return $http.post('/user/' + auth.currentUsername() + '/decks/'+card.deck._id+'/cards', card, {
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
				$http.post('/user/' + auth.currentUsername() + '/decks', deck, {
					headers: {Authorization: 'Bearer '+auth.getToken()}
				}).success(function(data){
					o.decks.push(data);
					return dfd.resolve(data);
				}).error(function(error){
					return dfd.reject(error);
				});
			} else {
				$http.post('/user/' + auth.currentUsername() + '/courses/'+JSON.parse(deck.course)._id+'/decks', deck, {
					headers: {Authorization: 'Bearer '+auth.getToken()}
				}).success(function(data){
					o.decks.push(data);
					return dfd.resolve(data);
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
			$http.post('/user/' + auth.currentUsername() + '/courses', course, {
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
	o.createMetacard = function(metacard) {
		var dfd = promiseFactory.defer();
		$http.post('/user/' + auth.currentUsername() + '/metacards', metacard, {
			headers: {Authorization: 'Bearer '+auth.getToken()}
		}).success(function(data){
			return dfd.resolve();
		}).error(function(error){
			return dfd.reject(error);
		});
		return dfd.promise;
	};
	o.createTest = function(test) {
		var dfd = promiseFactory.defer();
		$http.post('/user/' + auth.currentUsername() + '/tests', test, {
			headers: {Authorization: 'Bearer '+auth.getToken()}
		}).success(function(data){
			return dfd.resolve();
		}).error(function(error){
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
		return $http.post('/user/' + auth.currentUsername() + '/decks/' + deck._id + '/cards/' + card._id, auth, {
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
			return $http.post('/user/' + auth.currentUsername() + '/courses/' + course._id + '/decks/' + deck._id, auth, {
				headers: {Authorization: 'Bearer '+auth.getToken()}
			}).error(function(err){
				console.log(err);
			}).success(function(data){
				o.decks.push(data);
			});
		} else {
			return $http.post('/user/' + auth.currentUsername() + '/decks/' + deck._id, auth, {
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
		return $http.post('/user/' + auth.currentUsername() + '/courses/' + course._id, auth, {
			headers: {Authorization: 'Bearer '+auth.getToken()}
		}).error(function(err){
			console.log(err);
		}).success(function(data){
			o.courses.push(data);
		});
	}
	
	// LOVE CARD

	o.loveCard = function(card) {
		return $http.put('/user/' + auth.currentUsername() + '/cards/' + card._id + '/love', auth, {
			headers: {Authorization: 'Bearer '+auth.getToken()}
		}).error(function(err){
			console.log(err);
		}).success(function(data){
			card.loves += 1;
		});
	};
	
	// LOVE COMMENT
	
	o.loveComment = function(comment) {
		return $http.put('/comments/'+ comment._id + '/love', auth, {
			headers: {Authorization: 'Bearer '+auth.getToken()}
		}).success(function(data){
			comment.loves += 1;
		});
	};
	
	// UNLOVE CARD
	o.unloveCard = function(card) {
		return $http.get('/user/' + auth.currentUsername() + '/cards/' + card._id + '/unlove', {
			headers: {Authorization: 'Bearer '+auth.getToken()}
		}).error(function(err){
			console.log(err);
		}).success(function(data){
			card.loves -= 1;
		});
	}
	
	// UNSAVE CARD
	o.unsaveCard = function(card) {
		return $http.get('/user/' + auth.currentUsername() + '/cards/' + card._id + '/unsave', {
			headers: {Authorization: 'Bearer '+auth.getToken()}
		}).error(function(err){
			console.log(err);
		}).success(function(data){
			console.log(data);
		});
	}
	
	// UNSAVE DECK
	
	o.unsaveDeck = function(deck) {
		return $http.get('/user/' + auth.currentUsername() + '/decks/' + deck._id + '/unsave', {
			headers: {Authorization: 'Bearer '+auth.getToken()}
		}).error(function(err){
			console.log(err);
		}).success(function(data){
			console.log(data);
		});
	}
	
	// UNSAVE COURSE
	
	o.unsaveCourse = function(course) {
		return $http.get('/user/' + auth.currentUsername() + '/courses/' + course._id + '/unsave', {
			headers: {Authorization: 'Bearer '+auth.getToken()}
		}).error(function(err){
			console.log(err);
		}).success(function(data){
			console.log(data);
		});
	}
	
	// ADD COMMENTS
	
	o.addCardComment = function(comment) {
		return $http.post('/cards/' + comment.card._id + '/comments', comment, {
			headers: {Authorization: 'Bearer '+auth.getToken()}
		}).error(function(err){
			console.log(err);
		}).success(function(data){
			console.log("Success in adding a comment");
		});
	};
	o.addCourseComment = function(comment) {
		return $http.post('/courses/' + comment.course._id + '/comments', comment, {
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
		$http.get('/cards/language', {params: {language: language}})
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
		$http.get('/decks/language', {params: {language: language}})
		.success(function(data) {
			if(data.length == 0) return dfd.resolve();
			for(var i = 0; i < data.length; i++) {
				o.getDeck(data[i]._id).success(function(res) {
					var index = data.map(function(x) {return x._id; }).indexOf(res._id);
					o.searchDecks[index] = {};
					o.getDeckProgress(res._id).success(function(progress) {
						var deck = {content: res, progress: progress};
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
		$http.get('/courses/language', {params: {language: language}})
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
	
	o.getUsersInLanguage = function(language) {
		var dfd = promiseFactory.defer();
		$http.get('/browse/language', {params: {language: language}})
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
		return dfd.promise;
	}
	
	// GET STUFF FROM BROWSE CATEGORY
	
	o.getCardsInCategory = function(category) {
		var dfd = promiseFactory.defer();
		$http.get('/cards/category', {params: {category: category}})
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
		$http.get('/decks/category', {params: {category: category}})
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
		$http.get('/courses/category', {params: {category: category}})
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
		$http.get('/cards/query', {params: {query: query}})
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
		$http.get('/decks/query', {params: {query: query}})
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
		$http.get('/courses/query', {params: {query: query}})
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
		$http.get('/query/users', {params: {query: query}})
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
	
	// GET METACARD
	
	// get audio
	o.getMetacard = function(id) {
		return $http.get('/metacards/' + id)
		.error(function(error) {
			console.log(error);
		})
		.success(function(res){
			for(var i = 0; i < res.metacard.recordingFiles.length; i++) {
				var blob = FileService.b64toBlob([res.recordings[i]], "audio/mpeg");
				var objUrl = URL.createObjectURL(blob);
				res.metacard.recordingFiles[i] = objUrl;
			}
			return res.metacard;
		});
	};
	
	
	// GET CARD
	
	o.getCard = function(id, saveCard) {
		return $http.get('/cards/' + id)
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
		$http.get('/decks/' + id)
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
						var index = o.currentCourse.content.decks.map(function(x) {  if(x.content) return x.content._id; else return x._id; }).indexOf(res.deck._id);
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
		return $http.get('/courses/' + id)
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
	
	// GET TEST
	
	o.getTest = function(id) {
		return $http.get('/tests/' + id)
		.error(function(error) {
			console.log(error);
		})
		.success(function(res){
//			for(var i = 0; i < res.metacard.recordingFiles.length; i++) {
//				var blob = FileService.b64toBlob([res.recordings[i]], "audio/mpeg");
//				var objUrl = URL.createObjectURL(blob);
//				res.metacard.recordingFiles[i] = objUrl;
//			}
			return res.test;
		});
	};
	
	// GET FILE
	
	o.getFile = function(id) {
		return $http.get('/files/' + id)
		.success(function(data){ //, {responseType: "arraybuffer"}
			return data;
		}).error(function(err) {
			console.log(err);
		});
	};
	
	// GET PROGRESS
	
	o.getDeckProgress = function(deck) {
		return $http.get('/user/' + auth.currentUsername() + '/decks/' + deck + '/progress/')
		.error(function(err) {
			console.log(err);
		}).success(function(data) {
			return data;
		});
	}
	o.getCourseProgress = function(course) {
		return $http.get('/user/' + auth.currentUsername() + '/courses/' + course + '/progress/')
		.error(function(err) {
			console.log(err);
		}).success(function(data) {
			return data;
		});
	}
	
	// UPDATE PROGRESS INDEX
	
	o.updateDeckIndex = function(deck, progress, index) {
		return $http.put('/user/' + auth.currentUsername() + '/deck/progress/' + progress._id, {index: index}, {
			headers: {Authorization: 'Bearer '+auth.getToken()}
		}).error(function(err){
			console.log(err);
		}).success(function(data){
			return data;
		});
	}
	o.updateCourseIndex = function(course, progress, index) {
		return $http.put('/user/' + auth.currentUsername() + '/course/progress/' + progress._id, {index: index}, {
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
				if(typeof card.image === 'string' && card.image.substr(0, 4) == 'blob') {
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
					if(card.recordingFiles[index].type) {
						FileService.uploadRecording(card.recordingFiles[index])
						.success(function(data){
							resolve(data);
						})
						.error(function (err) {
							reject(err);
						});
					} else if(typeof card.recordingFiles[index] === 'string' && card.recordingFiles[index].substr(0, 4) == 'blob') {
						resolve(card.recordingFiles[index]);
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
				$http.post('/cards/' + card._id + '/update', card, {
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
		if(typeof deck.content.image === 'string' && deck.content.image.substr(0, 5) == 'blob:') {
			$http.post('/decks/' + deck.content._id + '/update', deck, {
				headers: {Authorization: 'Bearer '+auth.getToken()}
			}).success(function(data){
				return dfd.resolve();
			}).error(function(error){
				return dfd.reject(error);
			});
		} else {
			FileService.uploadImage(deck.content.image).success(function(res) {
				deck.content.image = res;
				$http.post('/decks/' + deck.content._id + '/update', deck, {
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
		if(typeof course.content.image === 'string' && course.content.image.substr(0, 5) == 'blob:') {
			$http.post('/courses/' + course.content._id + '/update', course, {
				headers: {Authorization: 'Bearer '+auth.getToken()}
			}).success(function(data){
				return dfd.resolve();
			}).error(function(error){
				return dfd.reject(error);
			});
		} else {
			FileService.uploadImage(course.content.image).success(function(res) {
				course.content.image = res;
				$http.post('/courses/' + course.content._id + '/update', course, {
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
		return $http.get('/cards/' + id + '/remove', {
			headers: {Authorization: 'Bearer '+auth.getToken()}
		}).error(function(error) {
			console.log(error);
		}).success(function(res){
			return res;
		});
	}
	
	// DELETE DECK
	
	o.deleteDeck = function(id) {
		return $http.get('/decks/' + id + '/remove', {
			headers: {Authorization: 'Bearer '+auth.getToken()}
		}).error(function(error) {
			console.log(error);
		}).success(function(res){
			return res;
		});
	}
	
	// DELETE COURSE
	
	o.deleteCourse = function(id) {
		return $http.get('/courses/' + id + '/remove', {
			headers: {Authorization: 'Bearer '+auth.getToken()}
		}).error(function(error) {
			console.log(error);
		}).success(function(res){
			return res;
		});
	}
	
	return o;
}])