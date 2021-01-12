const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const postReplySchema = new Schema({
  userType:{
    type:String,
    require:true,
  },
  userID:{
    type:String,
    require:true,
  },
  postID: {
    type:String,
    require:true,
  },
  content: {
    type:String,
    require:true,
  },
  created: {
    type: Date,
    default: Date.now
  },
});
module.exports = PostReply = mongoose.model('postReply', postReplySchema);
