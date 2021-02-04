var mongoose = require('mongoose');

var CourseSchema = new mongoose.Schema({
	name: String,
	caption: String,
	lang1: String,
	lang2: String,
	decks: [{type: mongoose.Schema.Types.ObjectId, ref:'Deck'}],
	metacards: [{type: mongoose.Schema.Types.ObjectId, ref:'Metacard'}],
	categories: [String],
	difficulty: String,
	image: {type: mongoose.Schema.Types.ObjectId, ref:'File'},
	author: String,
	saved: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
	comments: [{type: mongoose.Schema.Types.ObjectId, ref: 'Comment'}],
	tests: [{type: mongoose.Schema.Types.ObjectId, ref: 'Test'}]
},
{
    timestamps: true
});

mongoose.model('Course', CourseSchema);