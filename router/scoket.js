const express = require('express')
let fs = require('fs')
const app = express()
let port = 3002
    // 读取文件
 
const server = app.listen(port, () => {
        
console.log('成功启动express服务,端口号是' + port)
    })
//引入socket.io传入服务器对象 让socket.io注入到web网页服务
const io = require('socket.io')(server);
 
io.on('connection', function(socket) {
    console.log('初始化');
 
    // 接受 客户端 message事件
    socket.on("message", function (msg) {
            // 服务端推送客户端 客户端也要用 socket.on("message",(data)=>{}) 接收
            io.emit("message", msg) //服务器通过广播将新用户发送给全体群聊成员
    })
        //监听log事件
    socket.on("log", function (msg) {
        // 服务端推送客户端
        io.emit("log", msg) //服务器通过广播将新用户发送给全体群聊成员
    })
 
});