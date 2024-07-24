const mongoose = require('mongoose'); 

const orderSchema = mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,
    product:{type:mongoose.Schema.Types.ObjectId,required:true,ref:'Products'},
    amount:{type:Number,required:true},
    created_at:{type:Date,default:new Date()},
    updated_at:{type:Date,default:new Date()}
})

module.exports = mongoose.model('Orders',orderSchema);