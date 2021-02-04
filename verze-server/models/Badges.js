var mongoose = require('mongoose');

var BadgeSchema = new mongoose.Schema({
	name: String,
	lang1: String,
	lang2: String,
	difficulty: String,
	course: {type: mongoose.Schema.Types.ObjectId, ref: 'Course'},
	user: String
},
{
    timestamps: true
});

mongoose.model('Badge', BadgeSchema);