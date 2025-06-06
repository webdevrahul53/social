const mongoose = require('../connection');

const userSchema = mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,
    name:{type:String,required:true},
    email:{
        type:String,
        required:true,
        unique:true,
        match:/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    },
    password:{type:String,required:true},
    avatar:{type:String},
    followers: [ {type:[mongoose.Schema.Types.ObjectId], ref: 'Users'} ],
    following: [ {type:[mongoose.Schema.Types.ObjectId], ref: 'Users'} ]
})

module.exports = mongoose.model('Users',userSchema);