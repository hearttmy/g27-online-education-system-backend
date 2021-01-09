const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const stuSchema = new Schema({
  type:{
    //0 for Student
    //1 for Teacher
    type:String,
    default:0
  },
  id: {
    type: String,
    require: true,
    unique: true
  },
  username: {
    type: String,
    require: true
  },
  realName: {
    type:String,
    require: true
  },
  gender:{
    type:String,
    default:"",
  },
  password: {
    type: String,
    require: true
  },
  faculty: {
    type: String,
    require: true
  },
  email:{
    type: String,
    default:'',
    require: true

  },
  study:[{
    courseID : String,
  }],
  phone:{
    type:String,
    default:'',
  },
  avatar: {
    type: String,
    default: '/img/avatar/default.png'
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = Student = mongoose.model('Student', stuSchema);
