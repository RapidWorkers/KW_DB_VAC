var express = require('express');
var router = express.Router();
const getSqlConnection = require('../configs/mysql_load');
var bcrypt = require('bcrypt');

/* GET home page. */
router.get('/', function (req, res, next) {
  if (req.session.loggedin === undefined)
    res.render('login', { title: '로그인' });
  else {
    res.send("<script>alert('이미 로그인 되었습니다.');location.href='/';</script>");
  }
});

router.post('/', function (req, res, next) {
  var username = req.body.username;   //뒤의 username은 form에서의 name
  var passwd = req.body.passwd;

  if (req.session.loggedin === 1) {
    res.send("<script>alert('잘못된 경로로 접근했습니다!');</script>");
  }
  else {

    getSqlConnection((conn) => {
      //SQL 준비 작업
      var sqlGetPwdofUser = "SELECT uid, legal_name, passwd from USER where username = ?;";
      conn.query(sqlGetPwdofUser, [username], function (err, rows) {
        if (err) console.log("Error: MySQL returned ERROR : " + err);
        else {
          //Compare user password with saved password
          bcrypt.compare(passwd, rows[0].passwd, (err, isMatched) => {
            if (err) console.log("Error: bcrypt returned ERROR : " + err);//bcrypt error
            else {
              if (isMatched) {//password match
                /* NOTE: 자주 쓰는 정보는 Session에 담아두기, 매번 Query 요청은 성능 저하 */
                req.session.loggedin = 1;//then login
                req.session.uid = rows[0].uid;//set uid to use later
                req.session.legal_name = rows[0].legal_name;//set name to use later
                res.redirect("/");
              }
              else {//otherwise
                res.send("<script>alert('로그인에 실패했습니다.');location.href='login';</script>");//re-login
              }
            }
          })
        }
      })

      //Release connection
      conn.release();
    });
  }
})

module.exports = router;

