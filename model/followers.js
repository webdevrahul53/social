const mongoose = require('mongoose'); 

const followerSchema = mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,
    followed_by:{type:mongoose.Schema.Types.ObjectId,required:true,ref:'Users'},
    followed_to:{type:mongoose.Schema.Types.ObjectId,required:true,ref:'Users'},
    created_at:{type:Date,default:new Date()}
})

followerSchema.index({ followed_by: 1, followed_to: 1 }, { unique: true });

module.exports = mongoose.model('Followers',followerSchema);