var mongoose = require('mongoose');

var TestSchema = new mongoose.Schema({
	content: String,
	format: String,
	recordingFiles: [{type: mongoose.Schema.Types.ObjectId, ref: 'File'}],
	images: [{type: mongoose.Schema.Types.ObjectId, ref:'File'}],
	videos: [{type: mongoose.Schema.Types.ObjectId, ref:'File'}],
	deck: {type: mongoose.Schema.Types.ObjectId, ref:'Deck'},
	course: {type: mongoose.Schema.Types.ObjectId, ref:'Course'}
},
/*
 * questions: [
 * 			{ type: String, prompt: String, answer: String, choices: [String]}
 * ],
 * passage: String
 */
{
    timestamps: true
});

mongoose.model('Test', TestSchema);