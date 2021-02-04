var mongoose = require('mongoose');

var HotPickSchema = new mongoose.Schema({
	Id: String,
	type: String
},
{
    timestamps: true
});

mongoose.model('HotPick', HotPickSchema);