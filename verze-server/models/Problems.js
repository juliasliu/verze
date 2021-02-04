var mongoose = require('mongoose');

var ProblemSchema = new mongoose.Schema({
	user: String,
	description: String,
	email: String,
	extra: String
});

mongoose.model('Problem', ProblemSchema);