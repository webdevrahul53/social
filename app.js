var express = require('express');
var app = express();
var morgan = require('morgan'); 
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
const path = require('path');

var UserRouter = require('./router/users')
var PostRouter = require('./router/posts')
var FollowerRouter = require('./router/followers')
var MessageRouter = require('./router/messages')

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



app.use('/', express.static(path.join(__dirname, 'build')));
app.use('/api/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/users',UserRouter)
app.use('/api/posts',PostRouter)
app.use('/api/followers',FollowerRouter)
app.use('/api/messages',MessageRouter)

// Catch-all route to handle client-side routing in your front-end application
app.get('*', (req, res) => {
    const indexPath = path.join(__dirname, 'build', 'index.html');
    res.sendFile(indexPath, (err) => {
      if (err) {
        res.status(500).send(err);
      }
    });
});

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