require('dotenv').config();
var express = require('express');
var app = express();
var morgan = require('morgan'); 
var bodyParser = require('body-parser');
const path = require('path');
var http = require('http')
const { Server } =  require("socket.io");


var UserRouter = require('./router/users')
var PostRouter = require('./router/posts')
var FollowerRouter = require('./router/followers')
var MessageRouter = require('./router/messages')

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



// app.use('/', express.static(path.join(__dirname, 'build')));
// app.use('/', (req,res) => console.log('Hello world, Lorem ipsum is a sample text'));
app.use('/api/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/users',UserRouter)
app.use('/api/posts',PostRouter)
app.use('/api/followers',FollowerRouter)
app.use('/api/messages',MessageRouter)

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
var server = http.createServer(app);

const io = new Server(server, {
    cors: {origin: '*'}
});
io.on("connection", (socket) => {
    console.log('a user is connected')
    socket.on("message-sent", (message) => {
        socket.broadcast.emit("broadcast-message", message)
    })
}, err => console.log(err));

server.listen(4000,()=>{
    console.log('listening to port 4000')
});