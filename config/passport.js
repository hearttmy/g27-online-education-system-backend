const JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt;
const keys = require('./keys');
const Student = require('../modules/Student');

const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = keys.secretTokenKey;

const mongoose =require('mongoose');

module.exports = passport =>{
    passport.use(
        new JwtStrategy(opts, async function(jwt_payload, done) {
        const user = await Student.findById(jwt_payload._id);
        if(user){
            return done(null,user);
        }else{
            return done(null,false);
        }
        })
    );
};