var express = require('express');
var router = express.Router();
const getSqlConnection = require('../configs/mysql_load');
var bcrypt = require('bcrypt');

/* GET home page. */
router.get('/', function(req, res, next) {
  if(req.session.loggedin === undefined || req.session.loggedin ===0)
  {
    res.render('join', { title: '회원가입', loggedin: 0 });
  }
  else
  {
    res.send("<script>alert('잘못된 경로로 접근했습니다.');location.href='/';</script>");
  }
});


/* POST home page. */
router.post('/', function(req, res, next) {
  if(req.session.loggedin === undefined || req.session.loggedin ===0)
  {
    var username = req.body.username;
    var passwd = req.body.passwd;
    var legal_name = req.body.legal_name;
    var birthdate = req.body.birthdate;
    var sex = Number(req.body.sex);
    var zip = req.body.zip;
    var address = req.body.address;
    var address2 = req.body.address2;
    var email = req.body.email;
    var phone = req.body.phone;


    bcrypt.hash(passwd, 10, (err, hashedPasswd) => {
      //암호화 이후 실행할 내용
      

      getSqlConnection((conn) => {
        var sqlInsertUser = "INSERT INTO USER(username, passwd, legal_name, sex, birthdate, zip, address, address2, email, phone) VALUE(?,?,?,?,?,?,?,?,?,?);";
        conn.query(sqlInsertUser, [username, hashedPasswd, legal_name, sex, birthdate, zip, address, address2, email, phone], function(err, rows){
          if(err) console.log("Error: MySQL returned ERROR: " + err);
          else{
            res.render('email_auth', { title: '이메일 인증', loggedin: 0, email: email});
          }
        })
      })
    }); //비밀번호 암호화(), promise를 실행하겠다는 악속
    
  }
  else
  {
    res.send("<script>alert('잘못된 경로로 접근했습니다.');location.href='/';</script>");
  }
});

module.exports = router;