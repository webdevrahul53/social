var jwt = require('jsonwebtoken');

module.exports = (req,res,next)=>{

    if(req.headers.admin == process.env.admin){
        next();
    }else{
        return res.status(401).json({
            message:"You are not Authorized"
        })
    } 
}