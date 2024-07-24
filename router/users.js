var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');

const checkAdmin = require('../middleware/admin');
const Users = require('../model/users'); 


router.get('/',checkAdmin,(req,res)=>{
    Users.find().select("_id name email").exec().then(docs=>{ 
        res.status(200).json(docs) 
    }).catch(err=>{  
        res.status(500).json(err) 
    })
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
                    var token = jwt.sign({email:user.email,id:user._id},process.env.jwt_key,{expiresIn:"1h"});
                    res.status(200).json({
                        message:"Auth Successfull",
                        token:token,
                        data: {_id: user._id, email: user.email, name: user.name, token}
                    })
                }else{
                    res.status(500).json({
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

router.get('/:id',(req,res)=>{
    
    Users.findById(req.params['id']).select("_id name email").exec().then(docs=>{ 
        res.status(200).json(docs) 
    }).catch(err=>{ 
        res.status(500).json(err) 
    }) 

})

router.patch('/:id',(req,res)=>{  
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

router.delete('/:id',(req,res)=>{
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

router.delete('/',(req,res)=>{
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