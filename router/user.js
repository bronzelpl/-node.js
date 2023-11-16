const express = require("express");
const router = express.Router();
const db = require("../mysql/index");
// 加密
const jwt = require("jsonwebtoken");

const secretKey = require("./confing");
//  注册用户

router.post("/newUser", (req, res) => {
  const arr = req.body;

  // 查询语句判断用户是否已经存在
  const zhuceGo = "select userName from users where userName = ?";

  db.query(zhuceGo, arr.userNname, (err, resq) => {
    if (err) return console.log("数据库查询失败");

    if (resq.length !== 0) {
      res.send({code: 201, status: "用户名已存在"});
    }
    // 注册新用户
    else {
      // 插入用户语句
      const charuUser = "insert into users (userName,passWord) values (?,?)";

      //   删除多余的重复密码
      // delete arr.passWordAgn

      db.query(charuUser, [arr.userNname, arr.passWord], (errs, resu) => {
        if (errs) return console.log("数据库查询失败");
        if (resu.affectedRows == 1) {
          res.send({code: 200, status: "注册成功"});
        }
        // if(resu.aff)
      });
    }
  });
});
// 登录
router.post("/login", (req, res) => {
  //   console.log(secretKey.tokenH);
  const arr = req.body;
  const sqlurl = "select * from users where userName =?";
  db.query(sqlurl, [arr.userNname, arr.passWord], (err, resq) => {
    if (err) return console.log("数据库查询失败");
    // 生成token
    // 存在用户
    if (resq.length !== 0) {
      const tokenStr = jwt.sign({id: resq[0].id}, secretKey.secretKey, {
        expiresIn: secretKey.tokenH,
      });

      if (resq[0].passWord == arr.passWord) {
        res.send({
          code: 200,
          token: tokenStr,
          status: "登录成功！",
        });
      } else {
        res.send({
          code: 202,

          status: "密码错误",
        });
      }
    } else {
      res.send({
        code: 201,
        status: "用户不存在",
      });
    }
  });
});


// 查询好友接口
router.post("/findFriends",(req,res)=>{

console.log(req.body);
    const yong="select userName,passWord,userHead,id from users where userName like ?"

    db.query(yong,`${req.body.userName}%`,(err,ress)=>{

   
// 未查询到
        if(ress.length==0){

            res.send({
            code:201,

                status:'该用户不存在'
            })
        }else if(ress.length!==0){

            res.send({
                code:200,
                data:ress,
                status:"查询成功"
            })
        }
    })
   
})
module.exports = router;
