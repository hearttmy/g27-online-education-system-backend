const mongoose = require('mongoose');

const ASSchema = new mongoose.Schema({
  courseID:{
    type:String,
    require:true,
  },
  courseName:{
    type:String,
    require:true,
  },
  title:{
    type:String,
    require:true,
  },
  date: {
    type: Date,
    default: Date.now
  },
  type:{
    type:String,
    require:true,
  }
})

module.exports = asSchema = mongoose.model('ActivityStream', ASSchema);
