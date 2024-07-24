const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,
    productImage:{type:String,required:true},
    name:{type:String,required:true},
    price:{type:Number,required:true},
    size:{type:String},
    color:{type:String},
    stock:{type:Number,required:true}
})

module.exports = mongoose.model('Products',productSchema);