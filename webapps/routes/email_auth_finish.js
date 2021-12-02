var express = require('express');
var router = express.Router();
const getSqlConnection = require('../configs/mysql_load');

/* GET home page. */
router.get('/', function (req, res, next) {
  if (req.session.loggedin === undefined || req.session.loggedin === 0) {

    getSqlConnection((conn) => {
      var auth_link = req.query.auth_link;

      var sqlGetAuthLink = "SELECT email, auth_link FROM EMAIL_AUTH where auth_link = ?";
      var sqlUpdateIsUsed = "UPDATE EMAIL_AUTH SET is_used=1 where auth_link = ?";
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
  }
  else {
    res.send("<script>alert('잘못된 경로로 접근했습니다.');location.href='/';</script>");
  }
});

module.exports = router;

