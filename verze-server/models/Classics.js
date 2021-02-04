var mongoose = require('mongoose');

var ClassicSchema = new mongoose.Schema({
	Id: String,
	type: String
},
{
    timestamps: true
});

mongoose.model('Classic', ClassicSchema);