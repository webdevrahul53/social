var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
 
const checkAuth = require('../middleware/auth');
const Messages = require('../model/messages') 

router.get('/',(req,res)=>{
    Messages.find().select("_id participants messages created_at")
    .exec().then(docs=>{ 
        res.status(200).json(docs) 
    }).catch(err=>{  
        res.status(500).json(err) 
    })
})

router.post('/',checkAuth, async (req,res)=>{ 
    let {senderId, recipientId, messageText} = req.body;
    const newMessage = {
      _id: new mongoose.Types.ObjectId(),
      senderId: senderId,
      text: messageText,
      timestamp: new Date(),
      status: 'sent'
    };
    Messages.findOne({'participants.user_id': senderId, 'participants.user_id': recipientId}).exec().then(docs => {
      if(docs){
        Messages.updateOne({_id: docs._id}, {$push : {messages: newMessage}}).exec().then(result => {
          res.status(200).json({
            message:'Message sent',
            status: 1,
            chat_id: docs._id
          })
        }).catch(err => {
          res.status(500).json(err)
        })
      }else{
        const chat = new Messages({
          _id: new mongoose.Types.ObjectId(),
          participants: [
            {_id: new mongoose.Types.ObjectId(), user_id: senderId},
            {_id: new mongoose.Types.ObjectId(), user_id: recipientId},
          ],
          messages: [newMessage]
        })
        chat.save().then(docs => {
          res.status(200).json({
              message:'Message sent',
              status: 1,
              chatId: chat._id
          })
        }).catch(err => {
          res.status(500).json(err)
        })
      }
    }).catch(err => {
        res.status(500).json(err)
    })
    
})


router.get('/:senderId/:recipientId', checkAuth,(req,res)=>{
  let { senderId , recipientId} = req.params
  Messages.findOne({$and: [{'participants.user_id': senderId}, {'participants.user_id': recipientId}]}).populate('messages.senderId').exec().then(docs=>{ 
      if(docs){
        res.status(200).json(docs)
      }else {
        const chat = new Messages({
          _id: new mongoose.Types.ObjectId(),
          participants: [
            {_id: new mongoose.Types.ObjectId(), user_id: senderId},
            {_id: new mongoose.Types.ObjectId(), user_id: recipientId},
          ],
          messages: []
        })
        chat.save().then(docs => {
          res.status(200).json({
              message:'Chat created',
              status: 1,
              messages: []
          })
        }).catch(err => {
          res.status(500).json(err)
        })
      }
  }).catch(err=>{ 
      res.status(500).json(err) 
  }) 

})

router.get('/:id',(req,res)=>{
    
    Messages.findById(req.params['id']).exec().then(docs=>{ 
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
    Messages.update({_id:req.params['id']},{$set:updateOps}).exec()
    .then(docs=>{ 
        res.status(200).json({
            message:"Message data updated",
            _id:req.params['id']
        }) 
    }).catch(err=>{ 
        res.status(500).json(err) 

    }) 
})
router.delete('/',checkAuth,(req,res)=>{
    Messages.deleteMany({followed_by:req.body.followed_by, followed_to: req.body.followed_to}).exec()
    .then(docs=>{ 
        res.status(200).json({
            status: 1,
            message:"Message deleted",
            _id:req.params['id']
        }) 
    }).catch(err=>{ 
        res.status(500).json(err) 

    }) 
})


module.exports = router;