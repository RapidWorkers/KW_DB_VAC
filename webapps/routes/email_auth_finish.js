var express = require('express');
var router = express.Router();
const getSqlConnectionAsync = require('../configs/mysql_load').getSqlConnectionAsync;

/* GET home page. */
router.get('/', async function (req, res, next) {
  if (req.session.loggedin === undefined || req.session.loggedin === 0) {

    var auth_link = req.query.auth_link;

    var sqlGetAuthLink = "SELECT email, auth_link FROM EMAIL_AUTH where auth_link = ?;";
    var sqlUpdateIsUsed = "UPDATE EMAIL_AUTH SET is_used=1 where auth_link = ?;";

    try{
      var conn = await getSqlConnectionAsync();
      var [rows, fields] = await conn.query(sqlGetAuthLink, [auth_link]);//인증 링크로 이메일 얻기
      
      if(rows.length == 0)//DB에 존재하지 않는 link라면
      {
        res.send("<script>alert('잘못된 경로로 접근했습니다.');location.href='/';</script>");
      }
      else
      {
        var email = rows[0].email;//이메일 추출
        [rows, fields] = await conn.query(sqlUpdateIsUsed, [auth_link]);//인증 완료로 업데이트
        res.render('email_auth_finish', { title: '회원가입 완료', loggedin: 0, email: email});//페이지 렌더링
        conn.release();
      }

    }catch(err){
      console.log("Error: MySQL returned ERROR :" + err);
      conn.release();
    }
  }
  else {//로그인 했을때
    res.send("<script>alert('잘못된 경로로 접근했습니다.');location.href='/';</script>");
  }
});

module.exports = router;

