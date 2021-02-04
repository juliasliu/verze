var mongoose = require('mongoose');

var ProgressSchema = new mongoose.Schema({
	cardIndex: Number,
	deckIndex: Number,
	percentCorrect: Number,
	deck: {type: mongoose.Schema.Types.ObjectId, ref:'Deck'},
	course: {type: mongoose.Schema.Types.ObjectId, ref:'Course'},
	user: String
},
{
    timestamps: true
});

ProgressSchema.methods.updateDeckIndex = function(index, upd) {
	this.cardIndex = index;
	this.save(upd);
};

ProgressSchema.methods.updateCourseIndex = function(index, upd) {
	this.deckIndex = index;
	this.save(upd);
};

mongoose.model('Progress', ProgressSchema);