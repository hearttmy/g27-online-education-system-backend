const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const adminSchema = new Schema({
  type:{
    //0 for Student
    //1 for Teacher
    //2 for Administrator
    type:String,
    default:2
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
  email:{
    type: String,
    default:'',
    require: true
  },
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

module.exports = admin = mongoose.model('admin', adminSchema);
