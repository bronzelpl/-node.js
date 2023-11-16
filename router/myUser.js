const express = require("express");
const router = express.Router();
const db = require("../mysql/index");
// 获取用户信息
router.post("/information", (req, res) => {


  const arr = req.user;
  const sqlurl = "select * from users where id =?";

  db.query(sqlurl, arr.id, (err, ress) => {

    // 用户最近聊天不要返回
    delete ress[0].recentChats;
    // 用户密码不要返回
    delete ress[0].passWord;
    // 用户的好友列表不返回
    delete ress[0].friend
    // 返回用户信息
    if (ress.length !== 0) {
      res.send({
        code: 200,
        data: ress[0],
        status: "获取用户信息成功",
      });
    } else {
      res.send({
        code: 201,
        status: "获取失败",
      });
    }
  });
});
// 修改头像

router.post("/Modify", (req, res) => {
  const arr = req.user;

  const sqlurl = `update users set userHead=? where id=?`;
console.log(req.body.img,);
  db.query(sqlurl, [req.body.img, arr.id], (err, resa) => {
    if (resa.affectedRows === 1) {
      res.send({
        code: 200,
        data: req.body,
        status: "头像修改成功！",
      });
    }
  });
});

// 修改个人信息
router.post("/modifyInformation", (req, res) => {
  const arr = req.body;

  // 先判断是否有重名用户
  const yong = "select * from users where userName =?";

  db.query(yong, arr.userName, (errs, rescc) => {
  
    // 证明有相同的用户
    if (rescc.length == 1) {
      res.send({code: 201, status: "用户名已经存在"});
    } else {
      const sqlurls = `update users set ? where id=?`;

      db.query(sqlurls, [arr, arr.id], (err, resa) => {
        if (resa.affectedRows === 1) {
          res.send({
            code: 200,
            status: "个人信息修改成功!",
          });
        }
      });
    }
  });
});
// 获取用户最近聊天人
router.post("/recentchats", (req, res) => {
  // 查询用户的信息
  const yong = "select recentChats from users where id =?";

  db.query(yong,req.user.id,(err,ress)=>{

 


if(!err){

  if(ress[0]){
    let aes=JSON.parse(ress[0].recentChats)

    res.send({code:200,
      data:aes,
  status:"最近聊天获取成功"})
  }else{res.send({
    code:201,
    status:"无最近聊天"})}
   
}
  })



});
// 获取好友列表
router.get("/chatFriends",(req,ress)=>{


  const das="select friend from users where id =? "
 

  db.query(das,req.query.id,(err,res)=>{
   if(!err){

 
if(res[0].friend){
  ress.send({code:200,
  data:JSON.parse(res[0].friend),
status:'好友获取成功！'})
}else{

  ress.send({code:201,data:null,status:'好友为空'})
}
   }
  })
})
// 创建获取聊天对象的接口
module.exports = router;
