var jwt = require('jsonwebtoken');

module.exports = (req,res,next)=>{
    try{ 
        var token = req.headers.authorization.split(" ")[1]; 
        var decoded = jwt.verify(token,process.env.jwt_key);
        req.data = decoded
        next();
    }catch(err){
        return res.status(401).json({
            message:"You are not Authorized",
            error:err
        })
    } 
}