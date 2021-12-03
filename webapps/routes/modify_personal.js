var express = require('express');
var router = express.Router();
const getSqlConnectionAsync = require('../configs/mysql_load').getSqlConnectionAsync;
var bcrypt = require('bcrypt');

/* GET home page. */
router.get('/', async function(req, res, next) {
  if(req.session.loggedin === 1)
  {
    var sqlGetMyInfo = "SELECT username, zip, address, address2, phone FROM USER WHERE uid = ?;";

    try{
      var conn = await getSqlConnectionAsync();
      var [rows, fields] = await conn.query(sqlGetMyInfo, req.session.uid);

      var renderInfo = {
        title: "내 정보 바꾸기",
        loggedin: 1,
        legal_name: req.session.legal_name,
        username: rows[0].username,
        zipcode: rows[0].zip,
        address: rows[0].address,
        address2: rows[0].address2,
        phone: rows[0].phone,
        hasError: 0
      }

      if(req.query.hasError) renderInfo.hasError = parseInt(req.query.hasError);

      res.render('modify_personal', renderInfo);
      conn.release();
    }
    catch(err){
      conn.release();
    }

    
  }
  else
  {
    res.send('<script>alert("로그인이 필요합니다.");location.href="login";</script>');
  }
  
});

/* GET home page. */
router.post('/', async function(req, res, next) {
  if(req.session.loggedin === 1)
  {
    var sqlGetPwdofUser = "SELECT passwd from USER where username = ?;";
    var sqlCheckPhoneDup = "SELECT count(phone) from USER where phone = ? ";
    var sqlUpdateMyInfo = "UPDATE USER SET zip = ?, address = ?, address2 = ?, phone = ? where uid = ?;";
    var sqlUpdateMyPwd = "UPDATE USER SET passwd = ? where uid = ?;";

    try{
      var conn = await getSqlConnectionAsync();

      var current_passwd = req.body.current_passwd;
      var new_passwd = req.body.new_passwd;
      var zip = req.body.zipcode;
      var address = req.body.address;
      var address2 = req.body.address2;
      var phone = req.body.phone;
      

      var [rows, fields] = await conn.query(sqlGetPwdofUser, [req.session.uid]);
      bcrypt.compare(current_passwd, rows[0].passwd, async (err, isSame) => {//첫번째로 비밀번호 비교
        if(err) throw err;
        if(!isSame) 
        {
          conn.release();
          return res.redirect("modify_personal?hasError=1");
        }

        [rows, fields] = await conn.query(sqlCheckPhoneDup, [req.query.phone]);//두번째로 전화번호 중복 체크
        if(rows.length) 
        {
          conn.release();
          return res.redirect("modify_personal?hasError=2");
        }

        [rows, fields] = await conn.query(sqlUpdateMyInfo, [zip, address, address2, phone, req.session.uid]);
        
        if(new_passwd && new_passwd.length >= 1)//비밀번호 줬으면 업데이트 하세요
        {
          bcrypt.hash(new_passwd, 10, async (err, hashedPasswd) => {
            if(err) throw err;
            [rows, fields] = await conn.query(sqlUpdateMyPwd, [hashedPasswd, req.session.uid]);
            res.redirect("mypage");
            conn.release();
          })
        }
        
        res.redirect("mypage");
      })
    }
    catch(err){
      console.log("Error: MySQL returned ERROR : " + err);
      conn.release();
    }

    res.render('modify_personal', { title: 'Express', loggedin: 1, legal_name: req.session.legal_name});//놔둡시다 로직처리 할거라
  }
  else
  {
    res.send('<script>alert("로그인이 필요합니다.");location.href="login";</script>');
  }
    
  });

module.exports = router;
