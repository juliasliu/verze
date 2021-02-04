var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
mongoose.connect('mongodb://admin2:34567@ec2-35-166-3-103.us-west-2.compute.amazonaws.com:27017/verze');
var passport = require('passport');
var jwt = require('express-jwt');
var fs = require('fs');
var async = require('async');

require('../models/Problems');
require('../models/Comments');
require('../models/Users');
require('../models/Cards');
require('../models/Decks');
require('../models/Courses');
require('../models/Tests');
require('../models/Metacards');
require('../models/Progress');
require('../models/Badges');
require('../models/Languages');
require('../models/HotPicks');
require('../models/Classics');

var Promise = require("bluebird");
var join = Promise.join;
var Grid = require('gridfs-stream');
var GridFS = Grid(mongoose.connection.db, mongoose.mongo);
var multiparty = require('connect-multiparty');
var multipartyMiddleware = multiparty();

var nodemailer = require('nodemailer');

var Problem = mongoose.model('Problem');
var Comment = mongoose.model('Comment');
var User = mongoose.model('User');
var Card = mongoose.model('Card');
var Deck = mongoose.model('Deck');
var Course = mongoose.model('Course');
var Test = mongoose.model('Test');
var Metacard = mongoose.model('Metacard');
var Progress = mongoose.model('Progress');
var Badge = mongoose.model('Badge');
var Language = mongoose.model('Language');
var HotPick = mongoose.model('HotPick');
var Classic = mongoose.model('Classic');

var auth = jwt({secret: 'SECRET', userProperty: 'payload'});

/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('index', { title: 'Verze' });
});

/* REGISTER */
router.post('/register', function(req, res, next){
	if(!req.body.username || !req.body.password){
		return res.status(400).json({message: 'Please fill out all fields'});
	}

	var user = new User();

	user.username = req.body.username;
	user.firstname = req.body.firstname;
	user.lastname = req.body.lastname;
	user.email = req.body.email;
	user.country = req.body.country;
	user.birthday = req.body.birthday;
	user.languages = [];
	user.avatar = "596950fba6456ca22aefd113";
	user.phone = null;
	user.caption = "Just another human in the uniVerze";
	
	user.setPassword(req.body.password);

	user.save(function (err){
		if(err){ return next(err); }

		return res.json({token: user.generateJWT()})
	});
});

/* RESET AVATAR */

router.post('/users/:username/reset_avatar', function(req, res, next) {
	req.user.avatar = "596950fba6456ca22aefd113"; //594884af656162cc80f2333d
	req.user.save(function(err) {
		if(err){ return next(err); }
		
		return res.json(req.user);
	})
})

/* USER */

router.get('/users/:username', function(req, res, next){
	req.user.populate('followers following', function(err, user) {
		if (err) { return next(err); }

		return res.json({user: user, avatar: req.avatar});
	});
});

router.param('username', function(req, res, next, usrnam) {
	if(!usrnam){
		return res.status(400).json({message: 'Please provide a valid username!'});
	}
	var query = User.findOne({ username: usrnam });
	
	query.exec(function (err, user){
		if (err) { return next(err); }
		if (!user) { return next(new Error('can\'t find user')); }

		getFile(req, res, user.avatar, function(err, buffer){
			if (err) { return next(err); }
			req.avatar = buffer;
			req.user = user;

			req.user.populate('badges', function(err, user) {
				if (err) { return next(err); }

				req.user.populate('languages', function(err, user) {
					if (err) { return next(err); }
					return next();
				});
			});
		});
	});
});

/* FOLLOWERS & FOLLOWING */
router.get('/users/:username/followers', function(req, res, next){
	req.user.populate('followers', function(err, user) {
		if (err) { return next(err); }

		return res.json(user.followers);
	});
});
router.get('/users/:username/following', function(req, res, next){
	req.user.populate('following', function(err, user) {
		if (err) { return next(err); }

		return res.json(user.following);
	});
});


/* LOGIN */
router.post('/login', function(req, res, next){
	if(!req.body.username || !req.body.password){
		return res.status(400).json({message: 'Please fill out all fields'});
	}

	passport.authenticate('local', function(err, user, info){
		if(err){ return next(err); }

		if(user){
			return res.json({token: user.generateJWT()});
		} else {
			return res.status(401).json(info);
		}
	})(req, res, next);
});

/* UPDATE PROFILE */
router.post('/users/:username/update', function(req, res, next) {
	req.body.avatar = req.user.avatar;
	User.findByIdAndUpdate(req.user._id, req.body, {'upsert': 'true', 'new' : 'true'}, function(err, user) {
		if (err) return next(err);
		
		return res.json(user);
	})
})

/* UPDATE PASSWORD */
router.post('/check', function(req, res, next){
	if(!req.body.username || !req.body.password){
		return res.status(400).json({message: 'Please fill out all fields'});
	}

	passport.authenticate('local', function(err, user, info){
		if(err){ return next(err); }

		return res.json(user);
	})(req, res, next);
});

router.post('/users/:username/password', function(req, res, next) {
	if(!req.body.password){
		return res.status(400).json({message: 'Please fill out all fields'});
	}
	req.user.setPassword(req.body.password);
	req.user.save(function (err, user){
		if(err) return next(err);
		
		return res.json(user);
	});
});

/* USERS */
router.get('/users', function(req, res, next) {
	User.find(function(err, users) {
		if(err) { return next(err); }
		res.json(users);
	})
});

/* FOLLOW USER */
router.put('/users/:username/follow', auth, function(req, res, next) {
	var follower = req.body;
	req.user.addFollower(follower, function(err, user){
		if (err) { return next(err); }

		req.user.addExp(5, function(err, user){
			if (err) { return next(err); }

			User.update({username: follower.username},{$push: {following: user._doc}}, null, function(err){
				if(err){ return next(err); }
			
				res.json(user);
			});
		});
	});
});

/* UNFOLLOW USER incomplete */
router.put('/users/:username/unfollow', auth, function(req, res, next) {
	//remove follower from followed.followers
	req.user.removeFollower(function(err, card){
		if (err) { return next(err); }

		//remove followed from follower.following
		var index = req.user.loved.map(function(x) {return x.toString(); }).indexOf(req.card._id.toString());
		if (index > -1) {
			req.user.loved.splice(index, 1);
			req.user.save(function(err, user) {
				if(err){ return next(err); }
				res.json(card);
			})
		}
	})
});

/* CHANGE AVATAR */
router.put('/users/:username/avatar', auth, function(req, res, next) {
	req.user.changeAvatar(req.body.image, function(err, user){
		if (err) { return next(err); }

		res.json(user);
	});
})

/* ADD EXP POINTS */
router.put('/users/:username/exp', auth, function(req, res, next) {
	req.user.addExp(req.body.exp, function(err, user){
		if (err) { return next(err); }

		res.json(user);
	});
})

/* EARN BADGE */
router.post('/users/:username/badges', auth, function(req, res, next) {
	var badge = new Badge(req.body);
	badge.course = req.course;
	
	badge.save(function(err, badge){
		if(err){ return next(err); }

		req.user.badges.push(badge);
		req.user.save(function(err, user){
			if(err){ return next(err); }

			res.json(badge);
		});
	});
});

/* LEARN LANGUAGE */
router.post('/users/:username/languages', auth, function(req, res, next) {
	var language = new Language(req.body);
	
	language.save(function(err, language){
		if(err){ return next(err); }
	
		req.user.languages.push(language);
		req.user.save(function(err, user){
			if(err){ return next(err); }
	
			res.json(language);
		});
	});
});

/* UPDATE LANGUAGE */
router.post('/users/:username/languages/update', auth, function(req, res, next) {
	// remove old language
	var index = req.user.languages.map(function(x) {return x.name; }).indexOf(req.body.name);
	if (index > -1) {
		req.user.languages.splice(index, 1);
		req.user.save(function(err, user) {
			if(err){ return next(err); }
			
			// push new language
			var language = new Language(req.body);
			
			language.save(function(err, language){
				if(err){ return next(err); }
			
				req.user.languages.push(language);
				req.user.save(function(err, user){
					if(err){ return next(err); }
			
					res.json(language);
				});
			});
		})
	}
});

/* ALL */
router.get('/all', function(req, res, next) {
	function getCardsPromise()  {
		return new Promise(function(resolve, reject) {
			Card.find(function(err, cards) {
				if(err) { reject(err); }
				else resolve(cards);
			});
		});
	}
	function getDecksPromise()  {
		return new Promise(function(resolve, reject) {
			Deck.find(function(err, decks) {
				if(err) { reject(err); }
				else resolve(decks);
			});
		});
	}
	function getCoursesPromise()  {
		return new Promise(function(resolve, reject) {
			Course.find(function(err, courses) {
				if(err) { reject(err); }
				else resolve(courses);
			});
		});
	}
	function getImage(item)  {
		return new Promise(function(resolve, reject) {
			getFile(req, res, item._doc.image, function(err, buffer){
				if (err) { return next(err); }
				else resolve(buffer);
			});
		})	
	}

	join(getCardsPromise(), getDecksPromise(), getCoursesPromise(),
	function(cards, decks, courses) {
		res.json({cards:cards, decks:decks, courses:courses});
	});
});

router.get('/all/user/:username', function(req, res, next) {
	function getCardsPromise()  {
		return new Promise(function(resolve, reject) {
			req.user.populate('cards', function(err, user) {
				if (err) { return next(err); }
				else resolve(user.cards);
			});
		});
	}
	function getDecksPromise()  {
		return new Promise(function(resolve, reject) {
			req.user.populate('decks.content', function(err, user) {
				if (err) { return next(err); }
				else { 
					req.user.populate('decks.progress', function(err, user) {
						if (err) { return next(err); }
						else resolve(user.decks);
					});
				}
			});
		});
	}
	function getCoursesPromise()  {
		return new Promise(function(resolve, reject) {
			req.user.populate('courses.content', function(err, user) {
				if (err) { return next(err); }
				else { 
					req.user.populate('courses.progress', function(err, user) {
						if (err) { return next(err); }
						else resolve(user.courses);
					});
				}
			});
		});
	};

	join(getCardsPromise(), getDecksPromise(), getCoursesPromise(),
	function(cards, decks, courses) {
		res.json({cards:cards, decks:decks, courses:courses});
	});
});
/* SEARCH */

router.get('/all/:search', function(req, res, next) {
	
});

/* CARDS */
router.get('/cards/user/:username', function(req, res, next) {
	req.user.populate('cards', function(err, user) {
		if (err) { return next(err); }
		else res.json(user.cards);
	});
});

// GET LOVED

router.get('/cards/user/:username/loved', function(req, res, next) {
	req.user.populate('loved', function(err, user) {
		if (err) { return next(err); }
		else res.json(user.loved);
	});
});

// GET HOT PICKS

router.get('/hotpicks', function(req, res, next) {
	HotPick.find(function(err, hotpicks) {
		if(err) { next(err); }
		else res.json(hotpicks);
	});
});

//GET CLASSICS

router.get('/classics/courses', function(req, res, next) {
	Classic.find({ type: "course" }, function(err, courses) {
		if(err) { next(err); }
		else res.json(courses);
	});
});

router.get('/classics/decks', function(req, res, next) {
	Classic.find({ type: "deck" }, function(err, decks) {
		if(err) { next(err); }
		else res.json(decks);
	});
});

// BROWSE CATEGORY

router.get('/cards/category', function(req, res, next) {
	var query = Card.find({ categories: req.query.category });

	query.exec(function (err, cards){
		if (err) { return next(err); }
		if (!cards) { return next(new Error('can\'t find cards')); }

		res.json(cards);
	});
});

router.get('/decks/category', function(req, res, next) {
	var query = Deck.find({ categories: req.query.category });

	query.exec(function (err, decks){
		if (err) { return next(err); }
		if (!decks) { return next(new Error('can\'t find decks')); }

		res.json(decks);
	});
});

router.get('/courses/category', function(req, res, next) {
	var query = Course.find({ categories: req.query.category });

	query.exec(function (err, courses){
		if (err) { return next(err); }
		if (!courses) { return next(new Error('can\'t find courses')); }

		res.json(courses);
	});
});

// BROWSE LANGUAGE

router.get('/cards/language', function(req, res, next) {
	var language = req.query.language;
	var query = Card.find({ $or: [ { frontlang: language }, { backlang: language }] });

	query.exec(function (err, cards){
		if (err) { return next(err); }
		if (!cards) { return next(new Error('can\'t find cards')); }

		res.json(cards);
	});
});

router.get('/decks/language', function(req, res, next) {
	var language = req.query.language;
	var query = Deck.find({ $or: [ { lang1: language }, { lang2: language }] });

	query.exec(function (err, decks){
		if (err) { return next(err); }
		if (!decks) { return next(new Error('can\'t find decks')); }

		res.json(decks);
	});
});

router.get('/courses/language', function(req, res, next) {
	var language = req.query.language;
	var query = Course.find({ $or: [ { lang1: language }, { lang2: language }] });

	query.exec(function (err, courses){
		if (err) { return next(err); }
		if (!courses) { return next(new Error('can\'t find courses')); }

		res.json(courses);
	});
});

router.get('/browse/language', function(req, res, next) {
	var language = req.query.language;
	var query = User.find({languages: {$elemMatch: {name: language}}});

	query.exec(function (err, users){
		if (err) { return next(err); }
		if (!users) { return next(new Error('can\'t find users')); }

		res.json(users);
	});
});

// BROWSE QUERY

router.get('/cards/query', function(req, res, next) {
	var searchQuery = req.query.query;
	var query = Card.find({ $or: [ { frontphrase : {$regex : searchQuery, '$options' : 'i' }},
		{ backphrase : {$regex : searchQuery, '$options' : 'i' }},
		{ frontexample : {$regex : searchQuery, '$options' : 'i' }},
		{ backexample : {$regex : searchQuery, '$options' : 'i' }}] });
	
	query.exec(function (err, cards){
		if (err) { return next(err); }
		if (!cards) { return next(new Error('can\'t find cards')); }

		res.json(cards);
	});
});

router.get('/decks/query', function(req, res, next) {
	var searchQuery = req.query.query;
	var query = Deck.find({ name : {$regex : searchQuery, '$options' : 'i' }});
	
	query.exec(function (err, decks){
		if (err) { return next(err); }
		if (!decks) { return next(new Error('can\'t find decks')); }

		res.json(decks);
	});
});

router.get('/courses/query', function(req, res, next) {
	var searchQuery = req.query.query;
	var query = Course.find({ $or: [ { name : {$regex : searchQuery, '$options' : 'i' }},
		{ caption : {$regex : searchQuery, '$options' : 'i' }}] });
	
	query.exec(function (err, courses){
		if (err) { return next(err); }
		if (!courses) { return next(new Error('can\'t find courses')); }

		res.json(courses);
	});
});

router.get('/query/users', function(req, res, next) {
	var searchQuery = req.query.query;
	var query = User.find({ $or: [ { username : {$regex : searchQuery, '$options' : 'i' }},
		{ firstname : {$regex : searchQuery, '$options' : 'i' }},
		{ lastname : {$regex : searchQuery, '$options' : 'i' }}] });
	
	query.exec(function (err, users){
		if (err) { return next(err); }
		if (!users) { return next(new Error('can\'t find users')); }

		res.json(users);
	});
});

/* CREATE CARD */

router.post('/user/:username/cards', auth, function(req, res, next) {
	var card = new Card(req.body);
	card.author = req.payload.username;
	card.deck = null;
	
	card.save(function(err, card){
		if(err){ return next(err); }
		
		req.user.cards.push(card);
		req.user.addExp(5, function(err, user){
			if (err) { return next(err); }

			req.user.save(function(err, user){
				if(err){ return next(err); }

				res.json(card);
			});
		});
	});
});

/* CREATE CARD IN DECK */

router.post('/user/:username/decks/:deck/cards', auth, function(req, res, next) {
	var card = new Card(req.body);
	card.deck = req.deck;
	card.author = req.payload.username;
	
	card.save(function(err, card){
		if(err){ return next(err); }

		card.deck.cards.push(card);
		card.deck.save(function(err, deck) {
			if(err){ return next(err); }
			
			req.user.cards.push(card);
			req.user.save(function(err, user){
				if(err){ return next(err); }

				res.json(card);
			});
		});
	});
});

/* CARD */
router.param('card', function(req, res, next, id) {
	var query = Card.findById(id);

	query.exec(function (err, card){
		if (err) { return next(err); }
		if (!card) { return next(new Error('can\'t find card')); }

		req.card = card;
		return next();
	});
});

router.get('/cards/:card/', function(req, res, next) {
	function getComments()  {
		return new Promise(function(resolve, reject) {
			req.card.populate('comments', function(err, card) {
				if (err) { return next(err); }
				else resolve(card);
			});
		});
	}
	function getImage()  {
		return new Promise(function(resolve, reject) {
			getFile(req, res, req.card._doc.image, function(err, buffer){
				if (err) { console.log(err); return next(err); }
				else resolve(buffer);
			});
		});
	}
	function getRecordings(index) {
		return new Promise(function(resolve, reject) {
			if(req.card._doc.recordingFiles[index]) {
				getFile(req, res, req.card._doc.recordingFiles[index], function(err, recording){
					if (err) { return next(err); }
					else resolve(recording);
				});
			} else {
				resolve(null);
			}
		});
	}
	function getUser(author) {
		return new Promise(function(resolve, reject) {
			var query = User.findOne({username: author}, 'username avatar caption');
			query.exec(function (err, user){
				if (err) { reject(err); }
				if (!user) { reject(new Error('can\'t find user')); }
	
				getFile(req, res, user.avatar, function(err, avatar){
					if (err) { return next(err); }
					else {
						user.avatar = avatar;
						resolve(user);
					}
				});
			});
		});
	}
	
	join(getComments(), getImage(), getRecordings(0), getRecordings(1), getRecordings(2), getRecordings(3), getUser(req.card.author), function(card, buffer, recording1, recording2, recording3, recording4, author) {
		if(buffer == "") console.log("no buffer card: " + card._id);
		res.json({card: card, buffer: buffer, recording1: recording1, recording2: recording2, recording3: recording3, recording4: recording4, author: author});
	});
});

/* SAVE CARD */

router.post('/user/:username/decks/:deck/cards/:card', auth, function(req, res, next) {
	req.card.saved.push(req.user);
	req.card.deck = req.deck;
	req.card.save(function(err, card) {
		if(err){ return next(err); }
		
		req.user.cards.push(card);
		req.user.save(function(err, user){

			req.deck.cards.push(card);
			req.deck.save(function(err, deck) {
				if(err){ return next(err); }

				// find user who made the card
				var userQuery = User.findById(req.card.user);

				userQuery.exec(function (err, user){
					if (err) { return next(err); }
					if (!user) { return next(new Error('can\'t find user')); }

					user.addExp(5, function(err, user){
						if (err) { return next(err); }

						user.save(function(err, user){
							if(err){ return next(err); }

							res.json(card);
						});
					});
				})
			});
		});
	});
});

/* LOVE CARD */

router.put('/user/:username/cards/:card/love', auth, function(req, res, next) {
	req.card.love(function(err, card){
		if (err) { return next(err); }

		req.user.loved.push(card);
		req.user.save(function(err, user) {
			if(err){ return next(err); }
			
			// find user who made the card
			// find user who made the card
			var userQuery = User.findById(req.card.user);

			userQuery.exec(function (err, user){
				if (err) { return next(err); }
				if (!user) { return next(new Error('can\'t find user')); }

				user.addExp(5, function(err, user){
					if (err) { return next(err); }

					user.save(function(err, user){
						if(err){ return next(err); }

						res.json(card);
					});
				});
			})
		})
	});
});

/* UNLOVE CARD */
router.get('/user/:username/cards/:card/unlove', auth, function(req, res, next) {
	//decrease card.loves
	req.card.unlove(function(err, card){
		if (err) { return next(err); }

		//remove from user.loved
		var index = req.user.loved.map(function(x) {return x.toString(); }).indexOf(req.card._id.toString());
		if (index > -1) {
			req.user.loved.splice(index, 1);
			req.user.save(function(err, user) {
				if(err){ return next(err); }
				res.json(card);
			})
		}
	})
})

/* UNSAVE CARD */
router.get('/user/:username/cards/:card/unsave', auth, function(req, res, next) {
	//remove user from card.saved
	var savedIndex = req.card.saved.map(function(x) { return x.toString(); }).indexOf(req.user._id.toString());
	if (savedIndex > -1) {
		req.card.saved.splice(savedIndex, 1);
		req.card.save(function(err, card) {
			if(err){ return next(err); }
			
			res.json(card);
		})
	}
	
	//remove from deck.cards
	var deckQuery = Deck.findById(req.card.deck);

	deckQuery.exec(function (err, deck){
		if (err) { return next(err); }
		if (!deck) { return next(new Error('can\'t find deck')); }

		var index = deck.cards.indexOf(req.card._id);
		if (index > -1) {
			deck.cards.splice(index, 1);
			deck.save(function(err, deck) {
				if(err){ return next(err); }
			})
		}
	});
	
	//also delete from user.cards
	var index = req.user.cards.map(function(x) { return x.toString(); }).indexOf(req.card._id.toString());
	if (index > -1) {
		req.user.cards.splice(index, 1);
		req.user.save(function(err, user) {
			if(err){ return next(err); }
		})
	}
})

/* UNSAVE DECK */

router.get('/user/:username/decks/:deck/unsave', auth, function(req, res, next) {
	//remove user from deck.saved
	var savedIndex = req.deck.saved.map(function(x) { return x.toString(); }).indexOf(req.user._id.toString());
	if (savedIndex > -1) {
		req.deck.saved.splice(savedIndex, 1);
		req.deck.save(function(err, deck) {
			if(err){ return next(err); }
			
			res.json(deck);
		})
	}
	
	//if in course, remove from course.decks
	if(req.deck.course) {
		var courseQuery = Course.findById(req.deck.course);

		courseQuery.exec(function (err, course){
			if (err) { return next(err); }
			if (!course) { return next(new Error('can\'t find course')); }

			var deckIndex = course.decks.map(function(x) { return x.toString(); }).indexOf(req.deck._id.toString());
			if (deckIndex > -1) {
				course.decks.splice(deckIndex, 1);
				course.save(function(err, course) {
					if(err){ return next(err); }
				})
			}
		})
	}
	
	//also delete from user.decks
	var index = req.user.decks.map(function(x) { return x.content.toString(); }).indexOf(req.deck._id.toString());
	if (index > -1) {
		req.user.decks.splice(index, 1);
		req.user.save(function(err, user) {
			if(err){ return next(err); }
		})
	}
})

/* UNSAVE COURSE */

router.get('/user/:username/courses/:course/unsave', auth, function(req, res, next) {
	//remove user from course.saved
	var savedIndex = req.course.saved.map(function(x) { return x.toString(); }).indexOf(req.user._id.toString());
	if (savedIndex > -1) {
		req.course.saved.splice(savedIndex, 1);
		req.course.save(function(err, course) {
			if(err){ return next(err); }
			
			res.json(course);
		})
	}
	
	//also delete from user.courses
	var index = req.user.courses.map(function(x) { return x.content.toString(); }).indexOf(req.course._id.toString());
	if (index > -1) {
		req.user.courses.splice(index, 1);
		req.user.save(function(err, user) {
			if(err){ return next(err); }
		})
	}
})

/* UPDATE CARD */

router.post('/cards/:card/update', auth, function(req, res, next) {
	if(req.body.image.substr(0, 4) == 'blob') req.body.image = req.card.image;
	req.body.author = req.card.author;
	for(var i = 0; i < 4; i++) {
		if(req.body.recordingFiles[i] && req.body.recordingFiles[i].substr(0, 4) == 'blob') req.body.recordingFiles[i] = req.card.recordingFiles[i];
	}
	if(req.body.deck != "null" && req.body.deck != req.card.deck) {
			var deckContent = JSON.parse(req.body.deck);
			req.body.deck = {content: {}};
			req.body.deck.content = deckContent;
	}
	
	// deck-less to deck --> push
	if(req.card.deck == null && req.body.deck != "null") {
		// find deck
		var query = Deck.findById(req.body.deck.content._id);

		query.exec(function (err, deck){
			if (err) { return next(err); }
			if (!deck) { return next(new Error('can\'t find deck')); }

			deck.cards.push(req.body);
			deck.save(function(err, deck) {
				if(err){ return next(err); }
			})
			req.body.deck = req.body.deck.content;
			Card.findByIdAndUpdate(req.body._id, req.body, {'upsert': 'true', 'new' : 'true'}, function(err, card) {
				if (err) return next(err);
				
				return res.json(card);
			})
		});
		
	} // deck to different deck --> delete and push
	else if(req.card.deck != null && req.body.deck != "null" && req.body.deck.content && req.card.deck != req.body.deck.content._id) {
		// find deck
		var newQuery = Deck.findById(req.body.deck.content._id);

		newQuery.exec(function (err, deck){
			if (err) { return next(err); }
			if (!deck) { return next(new Error('can\'t find deck')); }

			deck.cards.push(req.body);
			deck.save(function(err, deck) {
				if(err){ return next(err); }
			})
			req.body.deck = req.body.deck.content;
			Card.findByIdAndUpdate(req.body._id, req.body, {'upsert': 'true', 'new' : 'true'}, function(err, card) {
				if (err) return next(err);
				
				return res.json(card);
			})
		});
		var oldQuery = Deck.findById(req.card.deck);

		oldQuery.exec(function (err, deck){
			if (err) { return next(err); }
			if (!deck) { return next(new Error('can\'t find deck')); }

			var index = deck.cards.indexOf(req.card._id);
			if (index > -1) {
				deck.cards.splice(index, 1);
				deck.save(function(err, deck) {
					if(err){ return next(err); }
				})
			}
		});
		
	} //deck to deck-less --> delete
	else if(req.card.deck != null && req.body.deck == "null") {
		// find deck
		var query = Deck.findById(req.card.deck);

		query.exec(function (err, deck){
			if (err) { return next(err); }
			if (!deck) { return next(new Error('can\'t find deck')); }

			var index = deck.cards.indexOf(req.card._id);
			if (index > -1) {
				deck.cards.splice(index, 1);
				deck.save(function(err, deck) {
					if(err){ return next(err); }
				})
			}
		});
		req.body.deck = null;
		Card.findByIdAndUpdate(req.body._id, req.body, {'upsert': 'true', 'new' : 'true'}, function(err, card) {
			if (err) return next(err);
			
			return res.json(card);
		})
	} // deck and still same deck
	else if(req.card.deck != null && req.body.deck != "null") {
		var deckContent = Deck.findById(req.body.deck);
		
		deckContent.exec(function (err, deck) {
			if (err) { return next(err); }
			if (!deck) { return next(new Error('can\'t find deck')); }

			req.body.deck = {content: {}};
			req.body.deck.content = deck;

			req.body.deck = req.body.deck.content;
			Card.findByIdAndUpdate(req.body._id, req.body, {'upsert': 'true', 'new' : 'true'}, function(err, card) {
				if (err) return next(err);
				
				return res.json(card);
			})
		})
	} // deck-less and still deck-less
	else {
		req.body.deck = null;
		Card.findByIdAndUpdate(req.body._id, req.body, {'upsert': 'true', 'new' : 'true'}, function(err, card) {
			if (err) return next(err);
			
			return res.json(card);
		})
	}
})

/* REMOVE CARD */

router.get('/cards/:card/remove', auth, function(req, res, next) {
	//if in deck, remove from deck.cards
	if(req.card.deck) {
		// find deck
		var deckQuery = Deck.findById(req.card.deck);

		deckQuery.exec(function (err, deck){
			if (err) { return next(err); }
			if (!deck) { return next(new Error('can\'t find deck')); }

			var index = deck.cards.indexOf(req.card._id);
			if (index > -1) {
				deck.cards.splice(index, 1);
				deck.save(function(err, deck) {
					if(err){ return next(err); }
				})
			}
		});
	}
	//also delete from user.cards
	var userQuery = User.findOne({ 'username': req.card.author });

	userQuery.exec(function (err, user){
		if (err) { return next(err); }
		if (!user) { return next(new Error('can\'t find user')); }

		var index = user.cards.map(function(x) {return x.toString(); }).indexOf(req.card._id.toString());
		if (index > -1) {
			user.cards.splice(index, 1);
			user.save(function(err, user) {
				if(err){ return next(err); }
			})
		}
	});
	
	Card.findByIdAndRemove(req.card._id, function(err, card) {
		if(err) { return next(err); }
		
		res.json(card);
	})
})

/* COMMENTS */

router.post('/cards/:card/comments', auth, function(req, res, next) {
	var comment = new Comment(req.body);
	comment.card = req.card;
	comment.course = null;
	comment.author = req.payload.username;
	
	comment.save(function(err, comment){
		if(err){ return next(err); }

		req.card.comments.push(comment);
		req.card.save(function(err, card) {
			if(err){ return next(err); }

			res.json(comment);
		});
	});
});

router.post('/courses/:course/comments', auth, function(req, res, next) {
	var comment = new Comment(req.body);
	comment.course = req.course;
	comment.card = null;
	comment.author = req.payload.username;
	
	comment.save(function(err, comment){
		if(err){ return next(err); }

		req.course.comments.push(comment);
		req.course.save(function(err, course) {
			if(err){ return next(err); }

			res.json(comment);
		});
	});
});

/* COMMENT */

router.param('comment', function(req, res, next, id) {
	var query = Comment.findById(id);

	query.exec(function (err, comment){
		if (err) { return next(err); }
		if (!comment) { return next(new Error('can\'t find comment')); }

		req.comment = comment;
		return next();
	});
});

router.put('/comments/:comment/love', auth, function(req, res, next) {
	req.comment.love(function(err, comment){
		if (err) { return next(err); }

		res.json(comment);
	});
});

/* DECKS */
router.get('/decks/user/:username', function(req, res, next) {
	req.user.populate('decks.content', function(err, user) {
		if (err) { return next(err); }
		else { 
			req.user.populate('decks.progress', function(err, user) {
				if (err) { return next(err); }
				else res.json(user.decks);
			});
		}
	});
});
//create course-less deck
router.post('/user/:username/decks', auth, function(req, res, next) {
	var deck = new Deck(req.body);
	deck.author = req.payload.username;
	deck.course = null;

	var progress = new Progress();
	progress.deck = deck._id;
	progress.course = null;
	progress.cardIndex = 0;
	progress.deckIndex = 0;
	progress.user = req.payload.username;

	progress.save(function(err, progress) {
		if(err){ return next(err); }
		
		deck.save(function(err, deck){
			if(err){ return next(err); }
			
			req.user.decks.push({content: deck, progress: progress});
			req.user.save(function(err, user){
				if(err){ return next(err); }

				res.json(deck);
			});
		});
	});
});
//create deck in course
router.post('/user/:username/courses/:course/decks', auth, function(req, res, next) {
	var deck = new Deck(req.body);
	deck.author = req.payload.username;
	deck.course = req.course;

	var progress = new Progress();
	progress.deck = deck._id;
	progress.course = null;
	progress.cardIndex = 0;
	progress.deckIndex = 0;
	progress.user = req.payload.username;

	progress.save(function(err, progress) {
		if(err){ return next(err); }
		
		deck.save(function(err, deck){
			if(err){ return next(err); }
			
			deck.course.decks.push(deck);
			deck.course.save(function(err, course) {
				if(err){ return next(err); }
			})
			
			req.user.decks.push({content: deck, progress: progress});
			req.user.save(function(err, user){
				if(err){ return next(err); }

				res.json(deck);
			});
		});
	});
});

/* DECK */
router.param('deck', function(req, res, next, id) {
	var query = Deck.findById(id);

	query.exec(function (err, deck){
		if (err) { return next(err); }
		if (!deck) { return next(new Error('can\'t find deck')); }

		req.deck = deck;
		return next();
	});
});

router.get('/decks/:deck', function(req, res, next) {
	function getCards() {
		return new Promise(function(resolve, reject) {
			req.deck.populate('cards', function(err, deck) {
				if (err) { return next(err); }
				else resolve(deck);
			});
		})
	}
	function getImage()  {
		return new Promise(function(resolve, reject) {
			getFile(req, res, req.deck._doc.image, function(err, buffer){
				if (err) { return next(err); }
				else resolve(buffer);
			});
		});
	}
	function getUser(author) {
		return new Promise(function(resolve, reject) {
			var query = User.findOne({username: author}, 'username avatar');
			query.exec(function (err, user){
				if (err) { reject(err); }
				if (!user) { reject(new Error('can\'t find user')); }
	
				getFile(req, res, user.avatar, function(err, avatar){
					if (err) { return next(err); }
					else {
						user.avatar = avatar;
						resolve(user);
					}
				});
			});
		});
	}
	
	join(getCards(), getImage(), getUser(req.deck.author), function(deck, buffer, author) {
		res.json({deck: deck, buffer: buffer, author: author});
	});
});
//save deck with no course
router.post('/user/:username/decks/:deck', auth, function(req, res, next) {
	req.deck.saved.push(req.user);
	
	var progress = new Progress();
	progress.deck = req.deck._id;
	progress.course = null;
	progress.cardIndex = 0;
	progress.deckIndex = 0;
	progress.user = req.payload.username;

	progress.save(function(err, progress) {
		if(err){ return next(err); }
		
		req.deck.save(function(err, deck) {
			if(err){ return next(err); }
			
			req.user.decks.push({content: deck, progress: progress});
			req.user.save(function(err, user){
				if(err){ return next(err); }
				
				// find user who made the card
				var userQuery = User.findById(req.deck.user);

				userQuery.exec(function (err, user){
					if (err) { return next(err); }
					if (!user) { return next(new Error('can\'t find user')); }

					user.addExp(5, function(err, user){
						if (err) { return next(err); }

						user.save(function(err, user){
							if(err){ return next(err); }

							res.json(deck);
						});
					});
				})
			});
		})
	});
});
//save deck to course
router.post('/user/:username/courses/:course/decks/:deck', auth, function(req, res, next) {
	req.deck.saved.push(req.user);
	req.deck.course = req.course;
	
	var progress = new Progress();
	progress.deck = req.deck._id;
	progress.course = null;
	progress.cardIndex = 0;
	progress.deckIndex = 0;
	progress.user = req.payload.username;

	progress.save(function(err, progress) {
		if(err){ return next(err); }
		
		req.deck.save(function(err, deck) {
			if(err){ return next(err); }
			
			req.course.decks.push(deck);
			req.course.save(function(err, course) {
				if(err){ return next(err); }
			})
			
			req.user.decks.push({content: deck, progress: progress});
			req.user.save(function(err, user){
				if(err){ return next(err); }

				// find user who made the card
				var userQuery = User.findById(req.deck.user);

				userQuery.exec(function (err, user){
					if (err) { return next(err); }
					if (!user) { return next(new Error('can\'t find user')); }

					user.addExp(5, function(err, user){
						if (err) { return next(err); }

						user.save(function(err, user){
							if(err){ return next(err); }

							res.json(deck);
						});
					});
				})
			});
		})
	});
});

/* UPDATE DECK */
router.post('/decks/:deck/update', auth, function(req, res, next) {
	if(req.body.content.image.substr(0, 4) == 'blob') req.body.content.image = req.deck.image;
	req.body.content.author = req.deck.author;
	
	// course-less to course --> push
	if(req.deck.course == null && req.body.content.course != null) {
		// find course
		var query = Course.findById(req.body.content.course.content._id);

		query.exec(function (err, course){
			if (err) { return next(err); }
			if (!course) { return next(new Error('can\'t find course')); }

			course.decks.push(req.body.content);
			course.save(function(err, course) {
				if(err){ return next(err); }
			})
			req.body.content.course = req.body.content.course.content;
			Deck.findByIdAndUpdate(req.deck._id, req.body.content, {'upsert': 'true', 'new' : 'true'}, function(err, deck) {
				if (err) return next(err);
				
				return res.json(deck);
			})
		});
		
	} // course to different course --> delete and push
	else if(req.deck.course != null && req.body.content.course != null && req.deck.course != req.body.content.course.content._id) {
		// find course
		var newQuery = Course.findById(req.body.content.course.content._id);

		newQuery.exec(function (err, course){
			if (err) { return next(err); }
			if (!course) { return next(new Error('can\'t find course')); }

			course.decks.push(req.body.content);
			course.save(function(err, course) {
				if(err){ return next(err); }
			})
			req.body.content.course = req.body.content.course.content;
			Deck.findByIdAndUpdate(req.deck._id, req.body.content, {'upsert': 'true', 'new' : 'true'}, function(err, deck) {
				if (err) return next(err);
				
				return res.json(deck);
			})
		});
		
		var oldQuery = Course.findById(req.deck.course);

		oldQuery.exec(function (err, course){
			if (err) { return next(err); }
			if (!course) { return next(new Error('can\'t find course')); }

			var index = course.decks.indexOf(req.deck._id);
			if (index > -1) {
				course.decks.splice(index, 1);
				course.save(function(err, course) {
					if(err){ return next(err); }
				})
			}
		});
		
	} //course to course-less --> delete
	else if(req.deck.course != null && req.body.content.course == null) {
		// find course
		var query = Course.findById(req.deck.course);

		query.exec(function (err, course){
			if (err) { return next(err); }
			if (!course) { return next(new Error('can\'t find course')); }

			var index = course.decks.indexOf(req.deck._id);
			if (index > -1) {
				course.decks.splice(index, 1);
				course.save(function(err, course) {
					if(err){ return next(err); }
				})
			}
		});
		Deck.findByIdAndUpdate(req.deck._id, req.body.content, {'upsert': 'true', 'new' : 'true'}, function(err, deck) {
			if (err) return next(err);
			
			return res.json(deck);
		})
	} // course and still course
	else if(req.deck.course != null && req.body.content.course != null) {
		req.body.content.course = req.body.content.course.content;
		Deck.findByIdAndUpdate(req.deck._id, req.body.content, {'upsert': 'true', 'new' : 'true'}, function(err, deck) {
			if (err) return next(err);
			
			return res.json(deck);
		})
	} // course-less and still course-less
	else {
		Deck.findByIdAndUpdate(req.deck._id, req.body.content, {'upsert': 'true', 'new' : 'true'}, function(err, deck) {
			if (err) return next(err);
			
			return res.json(deck);
		})
	}
})

/* REMOVE DECK */

router.get('/decks/:deck/remove', auth, function(req, res, next) {
	//if in course, delete from course.content.decks
	if(req.deck.course) {
		// find course
		var courseQuery = Course.findById(req.deck.course);

		courseQuery.exec(function (err, course){
			if (err) { return next(err); }
			if (!course) { return next(new Error('can\'t find course')); }

			var index = course.decks.indexOf(req.deck._id);
			if (index > -1) {
				course.decks.splice(index, 1);
				course.save(function(err, course) {
					if(err){ return next(err); }
				})
			}
		});
	}
	//also delete from user.decks
	var userQuery = User.findOne({ 'username': req.deck.author });

	userQuery.exec(function (err, user){
		if (err) { return next(err); }
		if (!user) { return next(new Error('can\'t find user')); }

		var index = user.decks.map(function(x) { return x.content.toString(); }).indexOf(req.deck._id.toString());
		if (index > -1) {
			user.decks.splice(index, 1);
			user.save(function(err, user) {
				if(err){ return next(err); }
			})
		}
	});
	
	//delete from all user.decks
	
	
	//delete all enclosed cards
	
	// remove progresses
	Progress.find({'deck': req.deck._id}, function(err, data) {
		async.each(data, function(dataItem, callback) {
			dataItem.remove(function(err, result) {
				if(err){ return next(err); }
			});
		});
	});
	
	Deck.findByIdAndRemove(req.deck._id, function(err, deck) {
		if(err) { return next(err); }

		res.json(deck);
	})
})

/* PROGRESS */
router.param('progress', function(req, res, next, id) {
	var query = Progress.findById(id);

	query.exec(function (err, progress){
		if (err) { return next(err); }
		if (!progress) { return next(new Error('can\'t find progress')); }

		req.progress = progress;
		return next();
	});
});

router.get('/user/:username/decks/:deck/progress', function(req, res, next) {
	Progress.findOne({deck: req.deck, user: req.user.username}, function(err, progress) {
		if(err) { return next(err); }
		res.json(progress);
	})
})

router.get('/user/:username/courses/:course/progress', function(req, res, next) {
	Progress.findOne({course: req.course, user: req.user.username}, function(err, progress) {
		if(err) { return next(err); }
		res.json(progress);
	})
})

router.put('/user/:username/deck/progress/:progress', auth, function(req, res, next) {
	req.progress.updateDeckIndex(req.body.index, function(err, progress){
		if (err) { return next(err); }

		res.json(progress);
	});
})

router.put('/user/:username/course/progress/:progress', auth, function(req, res, next) {
	req.progress.updateCourseIndex(req.body.index, function(err, progress){
		if (err) { return next(err); }

		res.json(progress);
	});
})

/* COURSES */
router.get('/courses/user/:username', function(req, res, next) {
	req.user.populate('courses.content', function(err, user) {
		if (err) { return next(err); }
		else { 
			req.user.populate('courses.progress', function(err, user) {
				if (err) { return next(err); }
				else res.json(user.courses);
			});
		}
	});
});
//create course
router.post('/user/:username/courses', auth, function(req, res, next) {
	var course = new Course(req.body);
	course.author = req.payload.username;

	var progress = new Progress();
	progress.course = course._id;
	progress.deck = null;
	progress.cardIndex = 0;
	progress.deckIndex = 0;
	progress.user = req.payload.username;

	progress.save(function(err, progress) {
		if(err){ return next(err); }
		
		//course.progress = progress;
		course.save(function(err, course){
			if(err){ return next(err); }
			
			req.user.courses.push({content: course, progress: progress});
			req.user.save(function(err, user){
				if(err){ return next(err); }

				res.json(course);
			});
		});
	});
});

/* COURSE */
router.param('course', function(req, res, next, id) {
	var query = Course.findById(id);

	query.exec(function (err, course){
		if (err) { return next(err); }
		if (!course) { return next(new Error('can\'t find course')); }

		req.course = course;
		return next();
	});
});

router.get('/courses/:course', function(req, res, next) {
	function getDecks() {
		return new Promise(function(resolve, reject) {
			req.course.populate('decks', function(err, course) {
				if (err) { return next(err); }
				
				else resolve(course);
			});
		})
	}
	function getComments() {
		return new Promise(function(resolve, reject) {
			req.course.populate('comments', function(err, course) {
				if (err) { return next(err); }
				
				else resolve(course.comments);
			});
		})
	}
	function getMetacards() {
		return new Promise(function(resolve, reject) {
			req.course.populate('metacards', function(err, course) {
				if (err) { return next(err); }
				
				else resolve(course.metacards);
			});
		})
	}
	function getImage()  {
		return new Promise(function(resolve, reject) {
			getFile(req, res, req.course._doc.image, function(err, buffer){
				if (err) { return next(err); }
				else resolve(buffer);
			});
		});
	}
	function getUser(author) {
		return new Promise(function(resolve, reject) {
			var query = User.findOne({username: author}, 'username avatar');
			query.exec(function (err, user){
				if (err) { reject(err); }
				if (!user || user == null) { reject(new Error('can\'t find user')); }
	
				getFile(req, res, user.avatar, function(err, avatar){
					if (err) { return next(err); }
					else {
						user.avatar = avatar;
						resolve(user);
					}
				});
			});
		});
	}
	
	join(getDecks(), getComments(), getMetacards(), getImage(), getUser(req.course.author), function(course, comments, metacards, buffer, author) {
		res.json({course: course, comments: comments, metacards: metacards, buffer: buffer, author: author});
	});
});
//save course
router.post('/user/:username/courses/:course', auth, function(req, res, next) {
	req.course.saved.push(req.user);
	
	var progress = new Progress();
	progress.course = req.course._id;
	progress.deck = null;
	progress.cardIndex = 0;
	progress.deckIndex = 0;
	progress.user = req.payload.username;

	progress.save(function(err, progress) {
		if(err){ return next(err); }
		
		req.course.save(function(err, course) {
			if(err){ return next(err); }

			req.user.courses.push({content: course, progress: progress});
			req.user.save(function(err, user){
				if(err){ return next(err); }

				res.json(course);
			});
		})
	});
});

/* UPDATE COURSE */
router.post('/courses/:course/update', auth, function(req, res, next) {
	if(req.body.content.image.substr(0, 4) == 'blob') req.body.content.image = req.course.image;
	req.body.content.author = req.course.author;
	
	for(var i = 0; i < req.body.content.decks.length; i++) {
		req.body.content.decks[i] = req.body.content.decks[i].content;
	}
	Course.findByIdAndUpdate(req.course._id, req.body.content, {'upsert': 'true', 'new' : 'true'}, function(err, course) {
		if (err) return next(err);
		
		return res.json(course);
	})
})

/* REMOVE COURSE */

router.get('/courses/:course/remove', auth, function(req, res, next) {
	// remove from user.courses
	var userQuery = User.findOne({ 'username': req.course.author });

	userQuery.exec(function (err, user){
		if (err) { return next(err); }
		if (!user) { return next(new Error('can\'t find user')); }

		var index = user.courses.map(function(x) {return x.content.toString(); }).indexOf(req.course._id.toString());
		if (index > -1) {
			user.courses.splice(index, 1);
			user.save(function(err, user) {
				if(err){ return next(err); }
			})
		}
	});
	
	//if the owner, delete from all user.decks
	
	
	// remove progresses
	Progress.find({'course': req.course._id}, function(err, data) {
		async.each(data, function(dataItem, callback) {
			dataItem.remove(function(err, result) {
				if(err){ return next(err); }
			});
		});
	});

	Course.findByIdAndRemove(req.course._id, function(err, course) {
		if(err) { return next(err); }

		res.json(course);
	})
})

/* METACARDS */
router.param('metacard', function(req, res, next, id) {
	var query = Metacard.findById(id);

	query.exec(function (err, metacard){
		if (err) { return next(err); }
		if (!metacard) { return next(new Error('can\'t find metacard')); }

		req.metacard = metacard;
		return next();
	});
});

router.get('/metacards/:metacard/', function(req, res, next) {
	function getRecordings(index) {
		return new Promise(function(resolve, reject) {
			if(req.metacard._doc.recordingFiles[index]) {
				getFile(req, res, req.metacard._doc.recordingFiles[index], function(err, recording){
					if (err) { return next(err); }
					else resolve(recording);
				});
			} else {
				resolve(null);
			}
		});
	}
	
	join(getRecordings(0), getRecordings(1), getRecordings(2), getRecordings(3), function(recording1, recording2, recording3, recording4) {
		res.json({metacard: req.metacard, recordings: [recording1, recording2, recording3, recording4]});
	});
});
// create metacard
router.post('/user/:username/metacards', auth, function(req, res, next) {
	var metacard = new Metacard(req.body);

	metacard.save(function(err, metacard){
		if(err){ return next(err); }
		
		// find course or deck
		if(metacard.course) {
			var courseQuery = Course.findOne({ '_id': metacard.course });
			courseQuery.exec(function (err, course){
				if (err) { return next(err); }
				if (!course) { return next(new Error('can\'t find course')); }
				
				course.metacards.push(metacard);
				course.save(function(err, course){
					if(err){ return next(err); }

					res.json(metacard);
				});
			});
		} else if(metacard.deck) {
			var deckQuery = Deck.findOne({ '_id': metacard.deck });
			deckQuery.exec(function (err, deck){
				if (err) { return next(err); }
				if (!deck) { return next(new Error('can\'t find deck')); }
				
				deck.metacards.push(metacard);
				deck.save(function(err, deck){
					if(err){ return next(err); }

					res.json(metacard);
				});
			});
		}
	});
});

/* TEST */

router.param('test', function(req, res, next, id) {
	var query = Test.findById(id);

	query.exec(function (err, test){
		if (err) { return next(err); }
		if (!test) { return next(new Error('can\'t find test')); }

		req.test = test;
		return next();
	});
});

//create test
router.post('/user/:username/tests', auth, function(req, res, next) {
	var test = new Test(req.body);

	test.save(function(err, test){
		if(err){ return next(err); }
		
		// find course or deck
		if(test.course) {
			var courseQuery = Course.findOne({ '_id': test.course });
			courseQuery.exec(function (err, course){
				if (err) { return next(err); }
				if (!course) { return next(new Error('can\'t find course')); }
				
				course.tests.push(test);
				course.save(function(err, course){
					if(err){ return next(err); }

					res.json(test);
				});
			});
		} else if(test.deck) {
			var deckQuery = Deck.findOne({ '_id': test.deck });
			deckQuery.exec(function (err, deck){
				if (err) { return next(err); }
				if (!deck) { return next(new Error('can\'t find deck')); }
				
				deck.tests.push(test);
				deck.save(function(err, deck){
					if(err){ return next(err); }

					res.json(test);
				});
			});
		}
	});
});

//get test
router.get('/tests/:test/', function(req, res, next) {
//	function getRecordings(index) {
//		return new Promise(function(resolve, reject) {
//			if(req.metacard._doc.recordingFiles[index]) {
//				getFile(req, res, req.metacard._doc.recordingFiles[index], function(err, recording){
//					if (err) { return next(err); }
//					else resolve(recording);
//				});
//			} else {
//				resolve(null);
//			}
//		});
//	}
//	
//	join(getRecordings(0), getRecordings(1), getRecordings(2), getRecordings(3), function(recording1, recording2, recording3, recording4) {
//		res.json({metacard: req.metacard, recordings: [recording1, recording2, recording3, recording4]});
//	});
	res.json({test: req.test});
});

/* FILES */

// GET FILE
router.get('/files/:file', function(req, res, next){
	getFile(req, res, req.params.file, function(err, buffer){
		if (err) { return next(err); }
		req.file = buffer;

		res.json(req.file);
	});
});

/* FILE UPLOAD */

router.post('/uploads', multipartyMiddleware, function (req, res) {
	var file = req.files.file;
	uploadFile(req, res);
});

var uploadFile = function(req, res, next) {
	var fileId = req.body.fileId;
	var filePath = req.body.filePath;
	var fileName = req.files.file.name;
	var fileType = req.files.file.type;
	
	if(fileId === '' || fileId === undefined)
		fileId = mongoose.Types.ObjectId().toString();

//	console.log('fileID to be written with is ' + fileId);

	var writestream = GridFS.createWriteStream({
		_id: fileId,
		filename : fileName,
		mode : 'w',
		content_type : fileType,
	});
	fs.createReadStream(req.files.file.path).pipe(writestream);

	writestream.on('close', function(file) {
		fileId = file._id;
//		console.log(file.filename + ' with fileID ' + fileId + ' Written To DB');
		fs.unlinkSync(req.files.file.path);
//        console.log('successfully deleted : ' + req.files.file.path);
        res.json(fileId);
	});
};

var getFile = function(req, res, id, callback) {
	var base64buf = "";

	GridFS.findOne({_id : id}, function(err, file) {
		if (err) {
			callback(err);
			return;
		}
		if (!file) {
			callback(new Error("Error " + 'can\'t find the file'));
			return;
		}
		var readStream = GridFS.createReadStream({
			_id : id
		});

		readStream.on("data", function (chunk) {
            base64buf += new Buffer(chunk).toString('base64');
        });

        readStream.on("end", function () {
            callback(null, base64buf);
            return;
        });
	});
}

/* REPORT */

router.post('/report/:username', function (req, res) {
//	reportAProblem(req, res);
	var problem = new Problem(req.body);
	problem.user = req.user.username;

	problem.save(function(err, problem) {
		if(err){ return next(err); }
		
		res.json(problem);
	})
});

//var transporter = nodemailer.createTransport({
//	service: 'gmail',
//	port: 465,
//	secure: true,
//	auth: {
//		user: 'verze.help@gmail.com',
//		pass: 'jalapeNo5salsa'
//	}
//});
//
//var reportAProblem = function(req, res) {
//	var mailOptions = {
//			from: '"Verze Help ?" <verze.help@gmail.com>',
//			to: 'verze.help@gmail.com',
//			subject: req.problem.description.substr(0, 10),
//			text: 'That was easy! Sent from:' + req.problem.email
//	};
//
//	transporter.sendMail(mailOptions, function(error, info){
//		if (error) {
//			console.log(error);
//		} else {
//			res.json(info);
//			console.log('Email sent: ' + info.response);
//		}
//	});
//}

module.exports = router;