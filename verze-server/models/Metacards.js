var mongoose = require('mongoose');

var MetacardSchema = new mongoose.Schema({
	notes: String,
	recordingFiles: [{type: mongoose.Schema.Types.ObjectId, ref: 'File'}],
	images: [{type: mongoose.Schema.Types.ObjectId, ref:'File'}],
	course: {type: mongoose.Schema.Types.ObjectId, ref:'Course'},
	order: {type: Number, default: 0}
},
{
    timestamps: true
});

mongoose.model('Metacard', MetacardSchema);