const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bulletins = new Schema({
        courseID : {
            type:String,
            require:true
        },
        title:{
            type:String,
            require:true
        },
        content:{
            type:String,
            require:true
        },
        created: {
            type: Date,
            default: Date.now
        }
});

module.exports = Bulletins = mongoose.model('bulletins', bulletins);