var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
var multer = require('multer');
const fs = require('fs');
const path = require('path');

const uploadDir = path.join(__dirname, '../uploads', 'avatars');

// Create the directory if it doesn't exist
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

var storage = multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,uploadDir)
    },
    filename:function(req,file,cb){
        var random = Math.round(Math.random()*100000000000);
        cb(null, 'Pro_'+ random + '_' + file.originalname)
    }
})

var fileFilter = function(req,file,cb){
    if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg' || file.mimetype === 'image/png'){
        cb(null,true)
    }else{
        cb(new Error('Upload Jpeg or Png file only !'),false)
    }
}

var upload = multer({
    storage:storage,
    limits:{
        fileSize:1024*1024*10
    },
    fileFilter:fileFilter
})
  

const checkAdmin = require('../middleware/admin');
const checkAuth = require('../middleware/auth');
const Users = require('../model/users'); 


const followAggregation = [
    {
        $lookup: {
            from: 'followers',
            localField: '_id',
            foreignField: 'followed_to',
            as: 'followersData'
        }
    },
    {
        $lookup: {
            from: 'followers',
            localField: '_id',
            foreignField: 'followed_by',
            as: 'followingData'
        }
    },
    {
        $addFields: {
            followers: {
                $map: {
                    input: '$followersData',
                    as: 'follower',
                    in: '$$follower.followed_by'
                }
            },
            following: {
                $map: {
                    input: '$followingData',
                    as: 'following',
                    in: '$$following.followed_to'
                }
            }
        }
    },
]


router.get('/',checkAdmin, async (req,res)=>{
    try {
        let result = await Users.aggregate([
            ...followAggregation,
            { $project: { _id: 1, name: 1, email: 1, avatar: 1, followers: 1, following: 1 } }
        ])
        res.status(200).json(result) 
    }catch(err) {
        res.status(500).json(err) 

    }

})

router.post('/signup',(req,res)=>{ 
      
    Users.find({email:req.body.email}).exec().then(docs=>{ 
        if(docs.length == 0){
            bcrypt.hash(req.body.password,10,(err,hash)=>{
                if(err){
                    res.status(500).json(err)
                }else{ 
                    const user = new Users({
                        _id:new mongoose.Types.ObjectId(),
                        name:req.body.name,
                        email:req.body.email,
                        password:hash
                    })
                    user.save().then(result=>{ 
                        res.status(200).json({
                            status: 1,
                            message:'New user added',
                            user:{
                                _id:user._id,
                                name:user.name,
                                email:user.email,
                            }
                        })
                    }).catch(err=>{
                        res.status(500).json(err)
                    })
                }
            })
            
        }else{
            res.status(500).json({
                status: 0,
                message:"Emaill Address is already taken by a user. Please assign another one."
            })
        }
    })
    
})

router.post('/login',(req,res)=>{
 
    Users.findOne({email:req.body.email})
    .exec()
    .then(user=>{
        console.log(user)
        if(user){ 
            bcrypt.compare(req.body.password,user.password,(err,result)=>{

                if(result){
                    var token = jwt.sign({email:user.email,id:user._id},process.env.jwt_key,{expiresIn:"24h"});
                    res.status(200).json({
                        status: 1,
                        message:"Auth Successfull",
                        token:token,
                        data: {_id: user._id, email: user.email, name: user.name, token}
                    })
                }else{
                    res.status(500).json({
                        status: 0,
                        message:"Auth Failed",
                        error:err
                    })
                }

            })
        }else{
            res.status(500).json({
                message:"Auth Failed"
            })
        }

    })
    .catch((err)=>{
        return res.status(500).json(err)
    })

})

router.get('/:id', async (req,res)=>{
    
    try {
        let result = await Users.aggregate([
            {$match: {_id: mongoose.Types.ObjectId(req.params['id'])}},
            ...followAggregation,
            { $project: { _id: 1, name: 1, email: 1, avatar: 1, followers: 1, following: 1 } }
        ])
        res.status(200).json(result[0]) 
    }catch(err) {
        res.status(500).json(err) 

    }

})

router.patch('/update_avatar/:id', checkAuth,(req,res)=>{  
    
    Users.update({_id:req.params['id']},{$set: {'avatar': req.body.image} }).exec()
    .then(docs=>{ 
        res.status(200).json({
            message:"User data updated",
            status: 1,
            _id:req.params['id']
        }) 
    }).catch(err=>{ 
        res.status(500).json(err) 

    }) 
})

router.patch('/:id', checkAuth,(req,res)=>{  
    var updateOps = {};
    for(let ops of req.body){
        updateOps[ops.propName] = ops.value;
    }
    Users.update({_id:req.params['id']},{$set:updateOps}).exec()
    .then(docs=>{ 
        res.status(200).json({
            message:"User data updated",
            _id:req.params['id']
        }) 
    }).catch(err=>{ 
        res.status(500).json(err) 

    }) 
})

router.delete('/:id', checkAuth,(req,res)=>{
    Users.deleteOne({_id:req.params['id']}).exec()
    .then(docs=>{ 
        res.status(200).json({
            message:"User deleted",
            _id:req.params['id']
        }) 
    }).catch(err=>{ 
        res.status(500).json(err) 

    }) 
})

router.delete('/', checkAdmin,(req,res)=>{
    Users.remove().exec()
    .then(docs=>{ 
        res.status(200).json({
            message:"All User data deleted"
        }) 
    }).catch(err=>{ 
        res.status(500).json(err) 

    }) 
})

module.exports = router;