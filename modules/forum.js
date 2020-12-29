const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const forum = new Schema({
    id : String,
    content: String,
    created: {
        type: Date,
        default: Date.now},
        forumtitle:{
            type:String,
            content:String,
        }
});

module.exports = Forum = mongoose.model('forum', forum);