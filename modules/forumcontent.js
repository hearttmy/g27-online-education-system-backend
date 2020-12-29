const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const forumcontent = new Schema({
    id : String,
    content: String,
    created: {
        type: Date,
        default: Date.now},
});

module.exports = Forumcontent = mongoose.model('forumcontent', forumcontent);