var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
 
const checkAuth = require('../middleware/auth');
const Followers = require('../model/followers') 

router.get('/',(req,res)=>{
    Followers.find().select("_id followed_by followed_to created_at")
    .exec().then(docs=>{ 
        res.status(200).json(docs) 
    }).catch(err=>{  
        res.status(500).json(err) 
    })
})

router.post('/',checkAuth,(req,res)=>{ 
    const follower = new Followers({
        _id:new mongoose.Types.ObjectId(),
        followed_by:req.body.followed_by,
        followed_to:req.body.followed_to,
    })
    follower.save().then(result=>{ 
        res.status(200).json({
            status: 1,
            message:'New follower added',
            follower:{
                _id:follower._id,
                followed_by:follower.followed_by,
                followed_to:follower.followed_to,
            }
        })
    }).catch(err=>{
        if (err.code === 11000) {
            res.status(500).json({status: 0, message: 'User is already followed'});
        }else {
            res.status(500).json(err)
        }
    }) 

})

router.get('/followed_user/:id', checkAuth, async (req,res)=>{
    try {
        let result = await Followers.aggregate([
            {$match: {followed_by: mongoose.Types.ObjectId(req.params['id'])}},
            {$lookup: {
                from: 'users',
                localField: 'followed_to',
                foreignField: '_id',
                as: 'user'
            }},
            {$unwind: '$user'},
            {$project: { followed_by: 1, user: 1}}
        ])
        res.status(200).json(result) 
    }catch(err) {
        res.status(500).json(err) 
    }
    // Followers.find({followed_by: req.params['id']}).exec().then(docs=>{ 
    //     res.status(200).json(docs) 
    // }).catch(err=>{ 
    //     res.status(500).json(err) 
    // }) 

})

router.get('/:id',(req,res)=>{
    
    Followers.findById(req.params['id']).exec().then(docs=>{ 
        res.status(200).json(docs) 
    }).catch(err=>{ 
        res.status(500).json(err) 
    }) 

})
router.patch('/:id',checkAuth,(req,res)=>{  
    var updateOps = {};
    for(let ops of req.body){
        updateOps[ops.propName] = ops.value;
    }
    Followers.update({_id:req.params['id']},{$set:updateOps}).exec()
    .then(docs=>{ 
        res.status(200).json({
            message:"Follower data updated",
            _id:req.params['id']
        }) 
    }).catch(err=>{ 
        res.status(500).json(err) 

    }) 
})
router.delete('/',checkAuth,(req,res)=>{
    Followers.deleteMany({followed_by:req.body.followed_by, followed_to: req.body.followed_to}).exec()
    .then(docs=>{ 
        res.status(200).json({
            status: 1,
            message:"Follower deleted",
            _id:req.params['id']
        }) 
    }).catch(err=>{ 
        res.status(500).json(err) 

    }) 
})


module.exports = router;