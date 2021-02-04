var mongoose = require('mongoose');

var CardSchema = new mongoose.Schema({
	frontlang: String,
	frontphrase: String,
	frontpronun: String,
	frontexample: String,
	backlang: String,
	backphrase: String,
	backpronun: String,
	backexample: String,
	recordingFiles: [{type: mongoose.Schema.Types.ObjectId, ref: 'File'}],
	notes: String,
	image: {type: mongoose.Schema.Types.ObjectId, ref:'File'},
	categories: [String],
	tags: [String],
	deck: {type: mongoose.Schema.Types.ObjectId, ref:'Deck'},
	fontstyle: String,
	fontsize: Number,
	author: String,
	loves: {type: Number, default: 0},
	saved: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
	comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }]
},
{
    timestamps: true
});


CardSchema.methods.love = function(cb) {
	this.loves++;
	this.save(cb);
};

CardSchema.methods.unlove = function(cb) {
	this.loves--;
	this.save(cb);
};

mongoose.model('Card', CardSchema);