var express = require('express');
var app = express();
var morgan = require('morgan'); 
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var UserRouter = require('./router/users')
var ProductRouter = require('./router/products')
var OrderRouter = require('./router/orders')
 
 
mongoose.connect('mongodb+srv://ecommerce:'+process.env.password+'@ecommerce.gmuch.mongodb.net/'+process.env.database+'?retryWrites=true&w=majority',
{ 
    useNewUrlParser: true,
    useUnifiedTopology: true 
}
)

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json())

app.use((req,res,next)=>{
    res.header('Access-Control-Allow-Origin','*')
    res.header(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    );
    if(req.method == 'OPTIONS'){
        res.header('Access-Control-Allow-Methods','GET, POST, PUT, PATCH, DELETE')
        return res.status(200).json({});
    }
    next()

})


app.use('/users',UserRouter)
app.use('/products',ProductRouter)
app.use('/orders',OrderRouter)

app.use((req,res,next)=>{
    var error = new Error('404 Not found !');
    error.status = 404;
    next(error)
})

app.use((error,req,res,next)=>{
    res.status = error.status || 500;
    res.json({
        message:error.message
    })
})

module.exports = app;