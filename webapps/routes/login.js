var express = require('express');
var router = express.Router();
const getSqlConnection = require('../configs/mysql_load');
var session = require("express-session");



/* GET home page. */
router.get('/', function(req, res, next) {
  if(req.session.loggedin === undefined)
    res.render('login', { title: '로그인' });
  else{
    res.send("<script>alert('이미 로그인 되었습니다.');location.href='/';</script>");
  }
    
  
});

router.post('/', function(req, res, next) {
  var username = req.body.username;   //뒤의 username은 form에서의 name
  var passwd = req.body.passwd;

  console.log(username);
  console.log(passwd);

  getSqlConnection((conn) => {
    //SQL 준비 작업
    var sqlLogin = "SELECT count(*) as loggedin from USER where username = ? and passwd = ?;"//prepared statement

    conn.query(sqlLogin, [username, passwd], function(err, rows){
      //SQL 실행
      if(err) console.err("Error: MySQL returned ERROR : " + err);
      console.log(rows[0]);
      //console.log(req.session);

      if(req.session.loggedin === undefined)
      {
        if(rows[0].loggedin == 0)
        {
          res.send("<script>alert('실패');location.href='login';</script>");
          //redirect가 혼자 쓰이는게 아닌 이상, 페이지 이동도 자바스크립트로 처리
        }
        else
        {
          req.session.loggedin = 1;
          res.redirect("/");
        }
      }
      else
      {
        res.send("<script>alert('잘못된 경로로 접근했습니다!');</script>");
      }

    });
    //정리
    conn.release();
  })  
  
});
  
module.exports = router;
  
