var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var multer = require('multer');

var storage = multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,'./uploads/products/')
    },
    filename:function(req,file,cb){
        var random = Math.round(Math.random()*100000000000);
        cb(null, 'Pro_'+ random + '_' + file.originalname)
    }
})

var fileFilter = function(req,file,cb){
    if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png'){
        cb(null,true)
    }else{
        cb(new Error('Upload Jpeg or Png file only !'),false)
    }
}

var upload = multer({
    storage:storage,
    limits:{
        fileSize:1024*1024*5
    },
    fileFilter:fileFilter
})
  
const checkAdmin = require('../middleware/admin');
const Products = require('../model/products');
const e = require('express');

router.get('/',(req,res)=>{
    Products.find().select("_id name price size color stock productImage").exec().then(docs=>{ 
        res.status(200).json(docs) 
    }).catch(err=>{  
        res.status(500).json(err) 
    })
})

router.post('/',checkAdmin,upload.single('productImage'),(req,res)=>{
    console.log(req.file) 
    const product = new Products({
        _id:new mongoose.Types.ObjectId(),
        productImage:req.file.path,
        name:req.body.name,
        price:req.body.price,
        size:req.body.size,
        color:req.body.color,
        stock:req.body.stock
    })
    product.save().then(result=>{ 
        res.status(200).json({
            message:'New product added',
            product:{
                _id:product._id, 
                name:product.name,
                price:product.price,
                size:product.size,
                color:product.color,
                stock:product.stock
            }
        })
    }).catch(err=>{
        res.status(500).json(err)
    }) 

})

router.get('/:id',(req,res)=>{
    
    Products.findById(req.params['id']).select("_id name price size color stock productImage").exec().then(docs=>{ 
        res.status(200).json(docs) 
    }).catch(err=>{ 
        res.status(500).json(err) 
    }) 

})
router.patch('/:id',checkAdmin,(req,res)=>{  
    var updateOps = {};
    for(let ops of req.body){
        updateOps[ops.propName] = ops.value;
    }
    Products.update({_id:req.params['id']},{$set:updateOps}).exec()
    .then(docs=>{ 
        res.status(200).json({
            message:"Product data updated",
            _id:req.params['id']
        }) 
    }).catch(err=>{ 
        res.status(500).json(err) 

    }) 
})
router.delete('/:id',checkAdmin,(req,res)=>{
    Products.deleteOne({_id:req.params['id']}).exec()
    .then(docs=>{ 
        res.status(200).json({
            message:"Product deleted",
            _id:req.params['id']
        }) 
    }).catch(err=>{ 
        res.status(500).json(err) 

    }) 
})
router.delete('/',checkAdmin,(req,res)=>{
    Products.remove().exec()
    .then(docs=>{ 
        res.status(200).json({
            message:"Product deleted"
        }) 
    }).catch(err=>{ 
        res.status(500).json(err) 

    }) 
})


module.exports = router;