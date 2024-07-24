var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
 
const checkAdmin = require('../middleware/admin');
const Orders = require('../model/orders') 

router.get('/',(req,res)=>{
    Orders.find().select("_id product amount created_at updated_at")
    .populate('product')
    .exec().then(docs=>{ 
        res.status(200).json(docs) 
    }).catch(err=>{  
        res.status(500).json(err) 
    })
})

router.post('/',checkAdmin,(req,res)=>{ 
    const order = new Orders({
        _id:new mongoose.Types.ObjectId(),
        product:req.body.productId,
        amount:req.body.amount,
        updated_at:new Date(),
    })
    order.save().then(result=>{ 
        res.status(200).json({
            message:'New order added',
            order:{
                _id:order._id,
                product:order.product, 
                amount:order.amount, 
                created_at:order.created_at, 
                updated_at:order.updated_at, 
            }
        })
    }).catch(err=>{
        res.status(500).json(err)
    }) 

})

router.get('/:id',(req,res)=>{
    
    Orders.findById(req.params['id']).exec().then(docs=>{ 
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
    Orders.update({_id:req.params['id']},{$set:updateOps}).exec()
    .then(docs=>{ 
        res.status(200).json({
            message:"Order data updated",
            _id:req.params['id']
        }) 
    }).catch(err=>{ 
        res.status(500).json(err) 

    }) 
})
router.delete('/:id',checkAdmin,(req,res)=>{
    Orders.deleteOne({_id:req.params['id']}).exec()
    .then(docs=>{ 
        res.status(200).json({
            message:"Order deleted",
            _id:req.params['id']
        }) 
    }).catch(err=>{ 
        res.status(500).json(err) 

    }) 
})


module.exports = router;