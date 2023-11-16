
const io=require('./myBna')

console.log(io);
// const chuli= function(socket) {
//     console.log('初始化');
  
//     // 接受 客户端 message事件
//     socket.on("message", function (msg) {
//       console.log(msg);
//             // 服务端推送客户端 客户端也要用 socket.on("message",(data)=>{}) 接收
//             io.emit("message", '你也好，我收到了你的信息') //服务器通过广播将新用户发送给全体群聊成员
//     })
//         //监听log事件
//     socket.on("log", function (msg) {
//         // 服务端推送客户端
//         io.emit("log", msg) //服务器通过广播将新用户发送给全体群聊成员
//     })
  
//   }
//   module.exports=chuli

function sck(){

    // 创建一个对象，用来保存用户
io.on('connection',  function(socket) {
    console.log('初始化');
  
    // 接受 客户端 message事件
    socket.on("message", function (userid) {
  
      console.log(socket.id);
  
  
      console.log("我上线了我的id是"+userid);
  
    
            // 服务端推送客户端 客户端也要用 socket.on("message",(data)=>{}) 接收
            io.emit("message", '你也好，我收到了你的信息') //服务器通过广播将新用户发送给全体群聊成员
    })
  
    socket.on("addFriends",()=>{
      console.log('收到了好友请求');
  
    })
        //监听log事件
    socket.on("log", function (msg) {
      
        // 服务端推送客户端
        io.emit("log", msg) //服务器通过广播将新用户发送给全体群聊成员
    })
  
  });
}

module.exports={
    sck:sck
}