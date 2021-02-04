var mongoose = require('mongoose');

var CommentSchema = new mongoose.Schema({
  content: String,
  author: String,
  avatar: String,
  loves: {type: Number, default: 0},
  card: { type: mongoose.Schema.Types.ObjectId, ref: 'Card' },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course'}
},
{
    timestamps: true
});

CommentSchema.methods.love = function(cb) {
	this.loves++;
	this.save(cb);
};

mongoose.model('Comment', CommentSchema);