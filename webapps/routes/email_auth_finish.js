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
      var [rows, fields] = await conn.query(sqlGetAuthLink, [auth_link]);
      
      if(rows.length == 0)//DB에 존재하지 않는 link라면
      {
        res.send("<script>alert('잘못된 경로로 접근했습니다.');location.href='/';</script>");
      }
      else
      {
        var email = rows[0].email;
        [rows, fields] = await conn.query(sqlUpdateIsUsed, [auth_link]);
        res.render('email_auth_finish', { title: '회원가입 완료', loggedin: 0, email: email});
        conn.release();
      }

    }catch(err){
      console.log("Error: MySQL returned ERROR :" + err);
      conn.release();
    }
    /*
    getSqlConnection((conn) => {
      var auth_link = req.query.auth_link;

      conn.query(sqlGetAuthLink, [auth_link], function (err, rows) {
        if (err) console.log("Error: MySQL returned ERROR : " + err);
        else {
          if (rows.length) { //이메일 인증 링크 확인
            var email = rows[0].email;

            conn.query(sqlUpdateIsUsed, [auth_link], function (err, rows) {
              if (err) console.log("Error: MySQL returned ERROR : " + err);
              else {
                res.render('email_auth_finish', { title: '회원가입 완료', loggedin: 0, email: email});
              }
            })
          }
          else {
            res.send("<script>alert('잘못된 경로로 접근했습니다.');location.href='/';</script>");
          }
        }
      })
    })

    */
  }
  else {
    res.send("<script>alert('잘못된 경로로 접근했습니다.');location.href='/';</script>");
  }
});

module.exports = router;

