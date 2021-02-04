var mongoose = require('mongoose');

var LanguageSchema = new mongoose.Schema({
	name: String,
	level: String,
	user: String
},
{
    timestamps: true,
    versionKey: false
});

mongoose.model('Language', LanguageSchema);