var mongoose = require('mongoose');

var DeckSchema = new mongoose.Schema({
	name: String,
	caption: String,
	lang1: String,
	lang2: String,
	cards: [{type: mongoose.Schema.Types.ObjectId, ref:'Card'}],
	categories: [String],
	course: {type: mongoose.Schema.Types.ObjectId, ref:'Course'},
	image: {type: mongoose.Schema.Types.ObjectId, ref:'File'},
	author: String,
	saved: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
	tests: [{type: mongoose.Schema.Types.ObjectId, ref: 'Test'}]
},
{
    timestamps: true
});

mongoose.model('Deck', DeckSchema);