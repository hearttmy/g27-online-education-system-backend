const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');


const tools = {
    enbcrypt(password){
        var salt = bcrypt.genSaltSync(10);
        var hash = bcrypt.hashSync(password, salt);
        return hash;
    },
    getavatar(url){

    }
};



module.exports = tools;