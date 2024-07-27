var jwt = require('jsonwebtoken');

module.exports = (req,res,next)=>{

    var token = req.headers.authorization.split(" ")[1]; 
    if(token == process.env.admin){
        next();
    }else{
        return res.status(401).json({
            message:"You are not Authorized"
        })
    } 
}