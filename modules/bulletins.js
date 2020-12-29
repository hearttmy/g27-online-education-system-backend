const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bulletins = new Schema({
        id : String,
        content: String,
        created: {
            type: Date,
            default: Date.now}
});

module.exports = Bulletins = mongoose.model('bulletins', bulletins);