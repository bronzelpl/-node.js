const express = require("express");
const app = express();
const userRouter = require("./router/user");
const path = require("path");
const myUser = require("./router/myUser");
const secretKey = require("./router/confing");
const fs = require("fs");
const db = require("./mysql/index");
var bodyParser = require("body-parser");
// const jwt =require('jsonwebtoken')
const expressTwt = require("express-jwt");

// socket服务

let port = 3002;
const server = app.listen(port, () => {
  console.log("成功启动express服务,端口号是" + port);
});
//引入socket.io传入服务器对象 让socket.io注入到web网页服务
const io = require("socket.io")(server);
// 创建一个对象，用来保存用户
var user = [];
//创建一个存储用户聊天记录的数据
var record = {};
// 查询出所有用户，都放入user中
const yong = "select id,userName from users";
db.query(yong, (err, res) => {
  user = res;
});
let qingkong = null
// 设置一个定时器，一分钟请求一次当前的时间，如果是晚上3点，则把聊天记录存入数据库
setInterval(() => {
  let time = new Date()


  // 获取当前的小时
  if (time.getHours() == 3) {
    // 清空服务器存储的聊天
    // 清空服务器的record，也要通知客户端清空不然又传进来了
  
  }
  
  if (qingkong()) {
    qingkong()
  }
  storeRecords();
  record = {}
}, 600000);



// 聊天记录存到数据库
const storeRecords = () => {
  const sql = "insert into  chatrrecord values(?,?,?,?)";

  if (Object.keys(record).length !== 0) {

    Object.keys(record).forEach((item) => {
      Object.keys(record[item]).forEach((i) => {

        db.query(
          sql,
          [item, i, JSON.stringify(record[item][i]),
            // 这个是最后一条的时间
            record[item][i][record[item][i].length - 1].time],
          (err, res) => {

          }
        );
      });
    });
  }
};

io.on("connection", function (socket) {
  console.log("初始化");

  qingkong = (a, b) => {

    io.emit("qingkong");
  }
  // 用户初始化上线事件
  socket.on("message", function (userid) {
    console.log(socket.id, "....", userid);
    // 把对应用户上线所分配的socket.id添加到用户信息中
    user.forEach((item) => {
      if (item.id == userid) {
        item.socketId = socket.id;
      }
    });
    // 如果是新用户，追加到
    if (!user.some((item) => item.id == userid)) {
      let newUser = {
        id: userid,
        socketId: socket.id,
      };
      user.push(newUser);
    }
    // 上线就看看自己有没有未读消息
    let wiedu = user.filter((item) => {
      return item.id == userid
    });
    if (wiedu[0].Unread) {

let weiid={}
let sdv=null
      // 如果有未读消息，循环未读消息，发送给自己
      const ups = `update users set recentChats=? where id=?`;
      wiedu[0].Unread.forEach((data) => {
        if(sdv==data.fid){
          weiid[data.fid]++
        }else{
          weiid[data.fid]=1
          sdv=data.fid
        }
       
        // 接收人的最近聊天中，发送人改为第一位
        // 要先获取被申请人的最近聊天，再追加进去
        const zui = `select recentChats from users where id =?`;
        db.query(zui, userid, (err, res) => {
          const jieData = JSON.parse(res[0].recentChats);
   
          jieData.filter((item, i) => {
            // 先删除，再追加
           
            if (item.id == data.fid) {
              jieData.splice(i, 1);
              item.text = data.data.res
              item.num=weiid[data.fid]
              
              jieData.unshift(item);
           // 再存入数据库
            }
        });
        db.query(ups, [JSON.stringify(jieData), userid], (err, cunres) => {
       
           //  刷新接收人的最近聊天
           socket.emit("send", data);
         });
      });
        socket.emit("receive", data);
      })
    // 推送消息发送后删除对应的消息
    user.forEach((item) => {
      if( item.id == userid){
       delete item.Unread
      }
     });
    }

    // 服务端推送客户端 客户端也要用 socket.on("message",(data)=>{}) 接收
    io.emit("message", "你也好，我收到了你的信息"); //服务器通过广播将新用户发送给全体群聊成员
  });

  // 获取最近聊天
  socket.on('zuijinf',(id)=>{
console.log('获取了最近聊天');
      // 查询用户的信息
  const yong = "select recentChats from users where id =?";

  db.query(yong,id,(err,ress)=>{




if(!err){

  if(ress[0].recentChats){
   
    let aes=JSON.parse(ress[0].recentChats)

    let dataf={code:200,
      data:aes,
  status:"最近聊天获取成功"}

   socket.emit('fanhuizuijin',dataf)
  }
  else
  {
  
    socket.emit('fanhuizuijin',{
      code:201,
      status:"无最近聊天"})
  }
   
}
  })

  })
  // 好友请求
  socket.on("addFriends", (data) => {
    // tid 要添加好友的id
    // fid 我的id
    console.log("收到了好友请求");


    // 添加前先判断是否已经是好友
    const shen = "select friend from users where id =?";
    db.query(shen,data.fid,(errm,rex)=>{


      if(rex[0].friend){
         let nav=JSON.parse(rex[0].friend)
         // 这是已经有好友的情况下
           if( nav.some((item)=>{return item.id==data.tid}))
          return socket.emit('chonf')
          tianj()
   
                // update addressList set 年龄=18 where 姓名='王伟华'

      }else{
        tianj()
      }



    })

    const tianj=()=>{
          //     {
    //       tid: item.id,
    //       fid: arr,//申请人的id
    // fuserName:store.userInfo.userName,//申请人的名字
    // fuserHead:store.userInfo.userHead,
    // status:2,//申请状态2申请中
    // time:new Date().toLocaleString()
    //     }
    // 收到好友请求后，把申请人的信息存入被申请人的最近聊天的数据库中
    // 把申请人的头像，id，用户名，申请状态申请时间存入
    // 要先获取被申请人的最近聊天，再追加进去
    const zui = `select recentChats from users where id =?`;

    db.query(zui, data.tid, (err, sesss) => {
      if (!err) {
        // 获取到的最近聊天
        // 好友不为空
        if (sesss[0].recentChats) {
          let dat = JSON.parse(sesss[0].recentChats);

          // 然后把添加好友的申请人加入到被申请人的最近聊天中但是状态为2

          // 申请人的信息
          const fdata = {
            id: data.fid,
            fuserName: data.fuserName,
            fuserHead: data.fuserHead,
            status: data.status,
            time: data.time,
            text: data.fuserName + "请求添加您为好友",
            num:1
          };

          // 先判断是否已经申请过了，防止重复添加
          if (
            dat.some((item) => {
              return item.id == fdata.id;
            })
          ) {
            //  前端提示已经添加
            socket.emit("zhongdfu");
          } else {
           
            // 追加到最前面
            dat.unshift(fdata);
            dat = JSON.stringify(dat);
            // 把新数据加入到数据库
            const up = `update users set recentChats=? where id=?`;
            db.query(up, [dat, data.tid], (err, ressa) => {
              // 用户好友列表加入成功
              if (ressa.affectedRows == 1) {
                user.filter((item) => {
                  if (item.id == data.tid) {
                    const arr = {
                      data: [fdata],
                    };

                    // 在用户中获取到对应添加用户的socket.id,然后向其广播
                    socket.to(item.socketId).emit("send", arr);
                    socket.emit('bus')
                  }
                });
              }
            });
          }
        }
        // 好友为空时直接添加
        else {
          // 申请人的信息
          const fdata = JSON.stringify([
            {
              id: data.fid,
              fuserName: data.fuserName,
              fuserHead: data.fuserHead,
              status: data.status,
              time: data.time,
              num:1,
              text: data.fuserName + "请求添加您为好友",
            },
          ]);

          // 把新数据加入到数据库
          const up = `update users set recentChats=? where id=?`;
          db.query(up, [fdata, data.tid], (err, ressb) => {
            // 用户好友列表加入成功

            // 在用户中获取到对应添加用户的socket.id,然后向其广播
            if (ressb.affectedRows == 1) {
              user.filter((item) => {
                if (item.id == data.tid) {
                  const arr = {
                    data: JSON.parse(fdata),

                    explain: "请求添加为好友",
                  };
                  socket.to(item.socketId).emit("send", arr);
                  socket.emit('bus')
                }
              });
            }
          });
        }
      }
    });
       
    }

    // 向添加的好友发送验证信息
  });
  // 同意好友
  socket.on("Agree", (data) => {

    
    console.log("同意好友");
    const up = `update users set friend=? where id=?`;
    // 好友同意后，把好友添加到对方的数据库status变成1
    data.fidata.status = 1;
    data.tdata.status = 1;
    // 把申请人的好友信息存入被申请人的数据库
    const shen = "select friend from users where id =?";
    // 先读取申请人的数据库好友信息，然后追加进去
    db.query(shen, data.fidata.id, (errr, shenres) => {
      // 有好友的情况
      if (shenres[0].friend) {
        // 把数据转换成数组再追加进去
        let shendata = JSON.parse(shenres[0].friend);
        //  把被申请人添加进去
        shendata.unshift(data.tdata);

        shendata = JSON.stringify(shendata);

        db.query(up, [shendata, data.fidata.id], (err, res) => { });
      }
      // 没有好友的情况
      else {
        let shendata = [data.tdata];

        shendata = JSON.stringify(shendata);

        db.query(up, [shendata, data.fidata.id], (err, res) => { });
      }
    });
    // 读取被申请人的信息，然后吧申请人存入
    db.query(shen, data.tdata.id, (errr, shenres) => {
      // 有好友的情况
      if (shenres[0].friend) {
        // 把数据转换成数组再追加进去
        let shendata = JSON.parse(shenres[0].friend);

        //  把被申请人添加进去
        shendata.unshift(data.fidata);

        shendata = JSON.stringify(shendata);

        db.query(up, [shendata, data.tdata.id], (err, res) => { });
      }
      // 没有好友的情况
      else {
        let shendata = [data.fidata];

        shendata = JSON.stringify(shendata);

        db.query(up, [shendata, data.tdata.id], (err, res) => { });
      }
    });
    // 然后把被申请人最近聊天里的申请人的状态改为1
    const zui = `select recentChats from users where id =?`;
    db.query(zui, data.tdata.id, (err, ress) => {
      // 这是已经存在最近聊天的情况
      if (ress[0].recentChats) {
        let zuidata = JSON.parse(ress[0].recentChats);

        zuidata.forEach((item) => {
          if (item.id === data.fidata.id) {
            item.status = 1;
            item.num=0
          }
        });
        zuidata = JSON.stringify(zuidata);

        // 再存入。。。。
        const ups = `update users set recentChats=? where id=?`;
        db.query(ups, [zuidata, data.tdata.id], (err, res) => { });
      }
    });
    // 申请人最近聊天里的申请人的状态改为1
    db.query(zui, data.fidata.id, (err, ress) => {
      if (ress[0].recentChats) {
        let zuidata = JSON.parse(ress[0].recentChats);
        //  把被申请人加入到最近聊天
        const beidata = {
          id: data.tdata.id,
          fuserName: data.tdata.userName,
          fuserHead: data.tdata.userHead,
          status: 1,
          time: data.tdata.time,
          text: data.tdata.userName + "请求添加您为好友",
          num:1
        };
        zuidata.unshift(beidata);
        // 然后更改status
        zuidata = JSON.stringify(zuidata);
        // 再存入。。。。
        const ups = `update users set recentChats=? where id=?`;
        db.query(ups, [zuidata, data.fidata.id], (err, res) => {
          if (res.affectedRows == 1) {

            socket.emit('fasongt')
          }
        });
      }
      // 这是不存在最近聊天情况
      else {
        const beishen = JSON.stringify([
          {
            id: data.tdata.id,
            fuserName: data.tdata.userName,
            fuserHead: data.tdata.userHead,
            status: 1,
            time: data.tdata.time,
            text: data.tdata.userName + "请求添加您为好友",
            num:1
          },
        ]);
        // 再存入。。。。
        const ups = `update users set recentChats=? where id=?`;
        db.query(ups, [beishen, data.fidata.id], (err, res) => {

          if (res.affectedRows == 1) {
            socket.emit('fasongt')
          }
        });
      }
      //  刷新被申请人和申请人的最近聊天列表
      user.filter((item) => {
        if (item.id == data.fidata.id) {

          //  刷新对方的最近聊天

          socket.to(item.socketId).emit("send");
        }
      });
      //  刷新自己的最近聊天

      socket.emit("shuaxin");
    });
  });

// 这是一个锁
  let fid;
  let tid

  // 用户更改信息后，好友列表也更改
  socket.on('genggai',(id,res)=>{
    console.log(23232323232);
    const zui = `select recentChats from users where id =?`;
    //  把发送人的最近聊天中的被发送人放在第一
    // 发送人 
    db.query(zui, id, (err, zuir) => {
      const shenuser = JSON.parse(zuir[0].recentChats);
      shenuser.filter((item, i) => {
        if (item.id == res.id) {
          // 删除指定最近聊天
          item.fuserName=res.userName
          item.fuserHead=res.userHead
          shenuser.splice(i, 1);
          // 把删除的放在第一位
          shenuser.unshift(item);
        }
        // 再存入数据库
        const ups = `update users set recentChats=? where id=?`;
        db.query(
          ups,
          [JSON.stringify(shenuser), id],
          (err, cunres) => {   //  刷新自己的最近聊天
            socket.emit("shuaxin");}
        );
      });
    });


    // 把申请人的好友信息存入被申请人的数据库
    const shen = "select friend from users where id =?";
    // 申请人的数据库好友信息，然后追加进去
    db.query(shen,id, (errr, shenres) => {
      // 有好友的情况
      console.log(shenres);
      if (shenres[0].friend) {
        // 把数据转换成数组再追加进去
        let shendata = JSON.parse(shenres[0].friend);

        
        //  把被申请人添加进去
        shendata.filter((item)=>{

          if(item.id==res.id){
            // 删除指定最近聊天
            item.userName=res.userName
            item.userHead=res.userHead
          }
        })
        shendata = JSON.stringify(shendata);
        const up = `update users set friend=? where id=?`;
        db.query(up, [shendata, id], (err, res) => { 
// 刷新好友列表
          socket.emit('haoyoushua')
        });
      }
      // 没有好友的情况
     
    });

    
  })
socket.on('dsdsx',()=>{
  socket.emit('sdxc')
})
  socket.on('fafa',(res)=>{
    socket.emit('bnm',{tid:res})
  })
  // 接受消息
  socket.on("fasong", (data,users) => {

    // 接收到消息发送给接收人
    // 在user找到接收人


    let receive = user.filter((item) => {
      return item.id == data.tid;
    });

    // 如果接受人不在线，也就是没有sockeId,那么把信息存入的对应的user接收人新增的Unread属性里
    //然后上线的时候就看看有没有数据，有的话调用发送信息接口，挨个发送
    // 这是不在线的情况
    if (!receive[0].socketId) {

      console.log("不在线");
      const zui = `select recentChats from users where id =?`;
      // 发送人的最近聊天中被发送人排在第一位
      db.query(zui, data.fid, (err, zuir) => {
        const shenuser = JSON.parse(zuir[0].recentChats);
        shenuser.filter((item, i) => {
          if (item.id == data.tid) {
            // 删除指定最近聊天
            shenuser.splice(i, 1);
            // 把最近的一条信息替换
            item.text = data.data.res
            // 把删除的放在第一位
            shenuser.unshift(item);
          }
          // 再存入数据库
          const ups = `update users set recentChats=? where id=?`;
          db.query(ups, [JSON.stringify(shenuser), data.fid], (err, cunres) => {
            //  刷新自己的最近聊天
          });
        });
      
      
        socket.emit("shuaxin");

      socket.emit('bnm',data)
      });

      user.forEach((item) => {
        // 找到接收人
        if (item.id == data.tid) {

          //  如果接收人的Unread属性没有，添加第一条信息
          if (!item.Unread) {
            item.Unread = [data];
          }
          // 如果已经有了Unread属性，则追加进去
          else {
            item.Unread.push(data);
          }

          console.log(item.Unread);
        }

      });
    }
    // 这是接收人在线的情况
    else {
    
      // 把信息发送给接收人
      console.log("接收人id" + receive[0].socketId);
      // 把最近聊天刷新到头部

      const zui = `select recentChats from users where id =?`;

      //  把发送人的最近聊天中的被发送人放在第一
      // 发送人 
      db.query(zui, data.fid, (err, zuir) => {
        const shenuser = JSON.parse(zuir[0].recentChats);

        shenuser.filter((item, i) => {
          if (item.id == data.tid) {
            // 删除指定最近聊天
            shenuser.splice(i, 1);
            item.text = data.data.res
            item.num=0
            // 把删除的放在第一位
            shenuser.unshift(item);
          }
          // 再存入数据库
          const ups = `update users set recentChats=? where id=?`;
          db.query(
            ups,
            [JSON.stringify(shenuser), data.fid],
            (err, cunres) => { }
          );
        });
        
        //  刷新自己的最近聊天
        socket.emit("shuaxin");
      });
      // 接收人的最近聊天中，发送人改为第一位
      db.query(zui, data.tid, (err, res) => {
   
        
        const jieData = JSON.parse(res[0].recentChats);
        jieData.filter((item, i) => {
          // 先删除，再追加
          if (item.id == data.fid) {
            jieData.splice(i, 1);
            // 追加最近一条信息
            item.text = data.data.res
            // item.num=0
            // 再把未读信息加进去
            item.num++
            jieData.unshift(item);
          }
        });
        // 再存入数据库
        const ups = `update users set recentChats=? where id=?`;
        db.query(ups, [JSON.stringify(jieData), data.tid], (err, cunres) => {
          //  刷新接收人的最近聊天
          socket.to(receive[0].socketId).emit("send", data);
        });
      });
      socket.to(receive[0].socketId).emit("receive", data,users);
    }
  });
  // 接收聊天记录
  socket.on("submission", (res, id) => {
    record[id] = res;

  });
  // 客户端请求聊天记录
  socket.on("getrecords", (id) => {

    // 先看看record里面有没有，有的话全部返回之后再请求就返回数据库里的

    if (record[id]) {
      // 有的话返回

      socket.emit("fanrecord", record[id]);
    }
    // 没有的话就从数据库获取
    else {
    }
  });
  // 创建获取聊天记录的接口
  socket.on('ersonal', (data) => {
    // 获取聊天表总行数

const kk="SELECT count(*) FROM ceshi.chatrrecord where id=? and duifangid=?"
db.query(kk,[data.id,data.duifangid],(err,res)=>{
  
   let num = res[0]['count(*)']
    


    const aa = 'SELECT data FROM chatrrecord WHERE id = ? and duifangid=? ORDER BY time LIMIT ?, ?'
// let numw=num-data.pages*data.pageNum>=0?num-data.pages*data.pageNum:0
let numw=num-(data.pages*data.pageNum)-data.pageNum

if(numw>=-data.pageNum){
  numw=numw<0?0:numw
 
  db.query(aa, [data.id, data.duifangid, numw, data.pageNum], (err, res) => {

    if (res.length !== 0) {

      res.forEach((item) => {

        item.data = JSON.parse(item.data)

      })

    }
    socket.emit('fanersonal', res, data.duifangid)
    // 循环转化成对象
  })
}else{
  socket.emit('tiaoaa')
}
  
  })
  })

  // 用户信息的未读时的信息数量
  socket.on('biaoshi',(data)=>{

   // 然后把被申请人最近聊天里的申请人的状态改为1
   const zui = `select recentChats from users where id =?`;
       // 发送人 
       db.query(zui, data.id, (err, zuir) => {
        const shenuser = JSON.parse(zuir[0].recentChats);

        shenuser.filter((item, i) => {
          if (item.id == data.tid) {
        //  把未读信息的标识改为0
       item.num=0
      
          }
          // 再存入数据库
          const ups = `update users set recentChats=? where id=?`;
          db.query(
            ups,
            [JSON.stringify(shenuser), data.id],
            (err, cunres) => { }
          );
        });
  
        //  刷新自己的最近聊天
        socket.emit("shuaxin");
      });
  })
  // 打开接收方的视频聊天框
socket.on('ship',(id,tid)=>{

  let recipient= user.filter((item)=>{

    return item.id==id
  })
  socket.to(recipient[0].socketId).emit("dakaishi",tid);
})
// 同意视频聊天
socket.on('tongyi',(res)=>{


  let recipient= user.filter((item)=>{

    return item.id==res
  })
  socket.to(recipient[0].socketId).emit("mytTongyi",tid);
})
// 通知接收方关闭视频聊天
socket.on('close',(id)=>{
  console.log(id);
  let recipient= user.filter((item)=>{

    return item.id==id
  })
  socket.to(recipient[0].socketId).emit("fguan");
})
  // 视频通话sdp交换发送给接收方
  socket.on('videoSdp',(res,id,users)=>{
    

     let recipient= user.filter((item)=>{

      return item.id==id
    })
    socket.to(recipient[0].socketId).emit("recipient",res,users);
  })
  // 返回给发送方sdp
  socket.on('farecipient',(res,id,suser)=>{

    let recipient= user.filter((item)=>{

      return item.id==id
    })
    socket.to(recipient[0].socketId).emit("jieshousdp",res,suser);
  })
  socket.on('iceTwo',(res,id)=>{
    console.log('SDSDSDS');
    let recipient= user.filter((item)=>{

      return item.id==id
    })
    socket.to(recipient[0].socketId).emit("jice",res);
  })
  // 发送给接收者ice
socket.on('ice',(res,id)=>{

  let recipient= user.filter((item)=>{

    return item.id==id
  })
  socket.to(recipient[0].socketId).emit("rice",res,id);
})
  // 视频通话的ice交换
  //监听log事件
  socket.on("log", function (msg) {
    // 服务端推送客户端
    io.emit("log", msg); //服务器通过广播将新用户发送给全体群聊成员
  });
  socket.on("disconnect", (reason) => {

    // 这个是登陆后链接发送来的id
    const id = socket.handshake.query.id
    //  delete user.id.socketId
    user.filter((item, i) => {
      if (item.id == id) {
        delete item.socketId
      }
    })
  
  });
});
// 配置解析数据
app.use(bodyParser.json({ limit: "5500000000kb" }));
app.use(bodyParser.urlencoded({ extended: true }));

// app.use(bodyParser.urlencoded({ extended: false }));//解析post请求数据
// 配置跨域
// app.use(cors())
// 配置解析token
// app.use(expressTwt({secret:secretKey.secretKey}).unless({path:[/^\/my\//]}))

app.use(expressTwt({ secret: secretKey.secretKey }).unless({ path: [/^\/lan\//] }));

// 注册路由
app.use("/lan", userRouter);
// 注册需要token的路由
app.use("/meng", myUser);

app.use((err, req, res, next) => {
  if (err.name === "UnauthorizedError") {
    return res.send({
      status: 401,
      message: "无效的token",
    });
  }
  res.send({
    status: 500,
    message: "未知的错误",
  });

  // 打印错误日志
  const err_log = `
        +---------------+-------------------------+
        错误名称：${err.name},\n
        错误信息：${err.message},\n
        错误时间：${new Date()},\n
        错误堆栈：${err.stack},\n
        +---------------+-------------------------+
    `;
  fs.appendFile(path.join(__dirname, "error.log"), err_log, () => {
    res.writeHead(500, { "Content-Type": "text/html;charset=utf-8" });
    res.end(`500 服务器内部错误`);
  });

  next();
});

app.listen(3004, (res) => {
  console.log("服务启动成功");
});

module.exports = io;
