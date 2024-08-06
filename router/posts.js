var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
const checkAuth = require('../middleware/auth');
const checkAdmin = require('../middleware/admin');
const Posts = require('../model/posts');

router.get('/', async (req,res)=>{
    Posts.find().select('user_id caption image likes comments created_at')
    .sort({created_at: -1}).populate('user_id').exec().then(docs => {
        res.status(200).json(docs)
    }).catch(err => {
        res.status(500).json(err)
    })
})

router.post('/',checkAuth,(req,res)=>{
    const post = new Posts({
        _id:new mongoose.Types.ObjectId(),
        user_id:req.body.user_id,
        image:req.body.image,
        caption:req.body.caption
    })
    post.save().then(result=>{ 
        res.status(200).json({
            message:'New post added',
            status: 1,
            post:{
                _id:post._id, 
                cation:post.cation,
                image: post.image
            }
        })
    }).catch(err=>{
        res.status(500).json(err)
    }) 

})

router.post('/add_comment/:id',checkAuth,(req,res)=>{
    const comment = {
        _id:new mongoose.Types.ObjectId(),
        user_id:req.body.user_id,
        email:req.body.email,
        text:req.body.text,
    }
    
    Posts.updateOne({_id: req.params['id']}, {$push: {'comments': comment}}).then(()=>{ 

        Posts.findById(req.params['id']).select('caption image likes comments').exec().then(docs=>{ 
            res.status(200).json({
                message:'Commented to post',
                status: 1,
                post: docs
            })
        }).catch(err=>{
            console.log(err)
            res.status(500).json(err)
        }) 

    }).catch(err=>{
        console.log(err)
        res.status(500).json(err)
    }) 

})

router.get('/:id',(req,res)=>{
    
    Posts.findById(req.params['id']).select("_id caption image").exec().then(docs=>{ 
        res.status(200).json(docs) 
    }).catch(err=>{ 
        res.status(500).json(err) 
    }) 

})

router.get('/user/:id',(req,res)=>{
    
    Posts.find({user_id: req.params['id']}).select("_id caption image").exec().then(docs=>{ 
        res.status(200).json(docs) 
    }).catch(err=>{ 
        res.status(500).json(err) 
    }) 

})

router.patch('/like/:id',checkAuth,(req,res)=>{ 
    console.log(req.body); 
    Posts.findById(req.params['id']).exec()
    .then(docs=>{ 
        let index = docs.likes.indexOf(req.body.user_id)
        if(req.body?.user_id && index == -1) {
            docs.likes.push(req.body.user_id)
            docs.save().then(() => {
                res.status(200).json({
                    status: 1,
                    message:"Post Liked",
                    _id:req.params['id'],
                    post: docs
                }) 
            }).catch(err => {
                res.status(500).json(err) 
            })
        }else {
            res.status(500).json({status:0});
        }
    }).catch(err=>{ 
        res.status(500).json(err) 
    }) 
})
router.patch('/unlike/:id',checkAuth,(req,res)=>{ 
    console.log(req.body); 
    Posts.findById(req.params['id']).exec()
    .then(docs=>{ 
        let index = docs.likes.indexOf(req.body.user_id)
        if(req.body?.user_id && index != -1) {
            docs.likes.splice(index, 1)
            docs.save().then(() => {
                res.status(200).json({
                    status: 1,
                    message:"Post UnLiked",
                    _id:req.params['id'],
                    post: docs
                }) 
            }).catch(err => {
                res.status(500).json(err) 
            })
        }else {
            res.status(500).json({status:0});
        }
    }).catch(err=>{ 
        res.status(500).json(err) 
    }) 
})

router.patch('/:id',checkAuth,(req,res)=>{  
    var updateOps = {};
    for(let ops of req.body){
        updateOps[ops.propName] = ops.value;
    }
    Posts.update({_id:req.params['id']},{$set:updateOps}).exec()
    .then(docs=>{ 
        res.status(200).json({
            message:"Post data updated",
            _id:req.params['id']
        }) 
    }).catch(err=>{ 
        res.status(500).json(err) 

    }) 
})
router.delete('/:id',checkAuth,(req,res)=>{
    Posts.deleteOne({_id:req.params['id']}).exec()
    .then(docs=>{ 
        res.status(200).json({
            status: 1,
            message:"Post deleted",
            _id:req.params['id']
        }) 
    }).catch(err=>{ 
        res.status(500).json(err) 

    }) 
})
router.delete('/',checkAdmin,(req,res)=>{
    Posts.remove().exec()
    .then(docs=>{ 
        res.status(200).json({
            message:"Post deleted"
        }) 
    }).catch(err=>{ 
        res.status(500).json(err) 

    }) 
})


module.exports = router;