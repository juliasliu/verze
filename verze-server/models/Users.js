var mongoose = require('mongoose');
var crypto = require('crypto');
var jwt = require('jsonwebtoken');

var UserSchema = new mongoose.Schema({
	username: {type: String, lowercase: true, unique: true},
	hash: String,
	salt: String,
	avatar: String,
	firstname: String,
	lastname: String,
	email: {type: String, unique: true},
	phone: Number,
	languages: [{name: String, level: String}],
	country: String,
	birthday: Date,
	website: String,
	caption: String,
	cards: [{type: mongoose.Schema.Types.ObjectId, ref:'Card'}],
	decks: [{content: {type: mongoose.Schema.Types.ObjectId, ref:'Deck'}, progress: {type: mongoose.Schema.Types.ObjectId, ref: 'Progress'}}],
	courses: [{content: {type: mongoose.Schema.Types.ObjectId, ref:'Course'}, progress: {type: mongoose.Schema.Types.ObjectId, ref: 'Progress'}}],
	loved: [{type: mongoose.Schema.Types.ObjectId, ref:'Card'}],
	badges: [{type: mongoose.Schema.Types.ObjectId, ref: 'Badge'}],
	followers: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
	following: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
	exp: {type: Number, default: 0}
},
{
    timestamps: true
});

UserSchema.methods.addFollower = function(follower, flw) {
	this.followers.push(follower);
	this.save(flw);
};

UserSchema.methods.changeAvatar = function(image, img) {
	this.avatar = image;
	this.save(img);
};

UserSchema.methods.addExp = function(expAmount, exp) {
	this.exp += expAmount;
	this.save(exp);
};

UserSchema.methods.setPassword = function(password){
	this.salt = crypto.randomBytes(16).toString('hex');

	this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, 'sha1').toString('hex');
};

UserSchema.methods.validPassword = function(password) {
	var hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, 'sha1').toString('hex');

	return this.hash === hash;
};

UserSchema.methods.generateJWT = function() {

	// set expiration to 60 days
	var today = new Date();
	var exp = new Date(today);
	exp.setDate(today.getDate() + 60);

	return jwt.sign({
		_id: this._id,
		username: this.username,
		exp: parseInt(exp.getTime() / 1000),
	}, 'SECRET');
};

mongoose.model('User', UserSchema);