const JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt;
const keys = require('./keys');
const Student = require('../modules/Student');
const Teacher = require('../modules/Teacher');

const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = keys.secretTokenKey;
const mongoose =require('mongoose');

module.exports = passport =>{
    passport.use(
        new JwtStrategy(opts, async function(jwt_payload, done) {
            let user;
            if(jwt_payload.type === 0){
                 user = await Student.find({id:jwt_payload.id});
            }else if(jwt_payload.type === 1){
                 user = await Teacher.find({id:jwt_payload.id});
            }
        if(user){
            return done(null,user);
        }else{
            return done(null,false);
        }
        })
    )
};