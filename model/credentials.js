const mongoose = require('../connection');

const credentialSchema = mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,
    email:{type:String,required:true},
    password:{type:String,required:true},
    created_at:{type:Date,default:new Date()}
})

module.exports = mongoose.model('Credentials',credentialSchema);