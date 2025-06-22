var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
const checkAuth = require('../middleware/auth');
const checkAdmin = require('../middleware/admin');
const Credentials = require('../model/credentials');

router.get('/', async (req,res)=>{
    try {
        const credentials = await Credentials.find().select("_id email password created_at");
        res.status(200).json(credentials);
    } catch (err) {
        res.status(500).json(err);
    }
})

router.post('/add',(req,res)=>{
    const {email, password} = req.body;
    if(!email || !password){
        return res.status(400).json({message: "email and password are required"});
    }
    const newCredential = new Credentials({
        _id: new mongoose.Types.ObjectId(),
        email: email,
        password: password
    });
    newCredential.save().then(result => {
        res.status(201).json({
            message: "Credential created successfully",
            credential: result
        });
    }).catch(err => {
        res.status(500).json(err);
    });
})



module.exports = router;