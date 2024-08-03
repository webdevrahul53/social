
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const promise=mongoose.connect(process.env.mongodburi, { 
    useNewUrlParser: true,
    useUnifiedTopology: true,
    'useCreateIndex': true 
});
promise.then(function(db) {
    console.log("Connected to database!!!");
}, function(err){
    console.log("Error in connecting database " + err);
});

module.exports = mongoose