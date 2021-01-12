const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const forum = new Schema({
  userType:{
    type:String,
    require:true,
  },
  userID:{
    type:String,
    require:true,
  },
  courseID: {
    type:String,
    require:true,
  },
  postTitle:{
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
  numOfReply:{
    type: Number,
    default:0,
  }
});
module.exports = Forum = mongoose.model('forum', forum);
