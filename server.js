var http = require('http')
var app = require('./app')
const { Server } =  require("socket.io");

var server = http.createServer(app);

const io = new Server(server, {
    cors: {origin: '*'}
});
io.on("connection", (socket) => {
    console.log('a user is connected')
    socket.on("message-sent", (message) => {
        socket.broadcast.emit("broadcast-message", message)
    })
});

server.listen(4000,()=>{
    console.log('listening to port 4000')
});