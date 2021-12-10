var express = require('express');
var router = express.Router();
const getSqlConnectionAsync = require('../configs/mysql_load').getSqlConnectionAsync;
var bcrypt = require('bcrypt');

/* GET home page. */
router.get('/', async function(req, res, next) {
  if(req.session.loggedin === 1)
  {
    //회원 정보 가져오기
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
      }//렌더링 정보 설정

      if(req.query.hasError) renderInfo.hasError = parseInt(req.query.hasError);//에러 있으면 설정

      res.render('modify_personal', renderInfo);//렌더링
      conn.release();
    }
    catch(err){
      conn.release();
    }

    
  }
  else  //로그인 예외 처린
  {
    res.send('<script>alert("로그인이 필요합니다.");location.href="login";</script>');
  }
  
});

/* GET home page. */
router.post('/', async function(req, res, next) {
  if(req.session.loggedin === 1)
  {
    var sqlGetPwdofUser = "SELECT passwd from USER where uid = ?;";
    var sqlCheckPhoneDup = "SELECT count(phone) as duplicate from USER where phone = ? and uid != ?;";
    var sqlUpdateMyInfo = "UPDATE USER SET zip = ?, address = ?, address2 = ?, phone = ? where uid = ?;";
    var sqlUpdateMyPwd = "UPDATE USER SET passwd = ? where uid = ?;";

    try{
      var conn = await getSqlConnectionAsync();

      //각종 변수 가져오기
      var current_passwd = req.body.current_passwd;
      var new_passwd = req.body.new_passwd;
      var zip = req.body.zip;
      var address = req.body.address;
      var address2 = req.body.address2;
      var phone = req.body.phone;
      

      var [rows, fields] = await conn.query(sqlGetPwdofUser, [req.session.uid]);//유저 비밀번호 가져오기

      /* Data validation */
      var valResult = true;

      var phoneRegex = /^\d{2,3}-\d{3,4}-\d{4}$/;
      var zipRegex = /^\d{5}$/

      if(!current_passwd) valResult = false;
      if(!zipRegex.test(zip)) valResult = false;
      if(!address) valResult = false;
      if(!phoneRegex.test(phone)) valResult = false;

      if(!valResult) return res.redirect("modify_personal?hasError=3");//검증 실패한 경우 되돌리기

      bcrypt.compare(current_passwd, rows[0].passwd, async (err, isSame) => {//첫번째로 비밀번호 비교
        if(err) throw err;
        if(!isSame)
        {
          conn.release();
          return res.redirect("modify_personal?hasError=1");//검증 실패한 경우 되돌리기
        }

        [rows, fields] = await conn.query(sqlCheckPhoneDup, [phone, req.session.uid]);//두번째로 전화번호 중복 체크
        if(rows[0].duplicate != 0) 
        {
          conn.release();
          return res.redirect("modify_personal?hasError=2");//검증 실패한 경우 되돌리기
        }

        [rows, fields] = await conn.query(sqlUpdateMyInfo, [zip, address, address2, phone, req.session.uid]);//내 정보 업데이트
        
        if(new_passwd && new_passwd.length >= 1)//비밀번호 줬으면 업데이트
        {
          bcrypt.hash(new_passwd, 10, async (err, hashedPasswd) => {//해시처리
            if(err) throw err;
            [rows, fields] = await conn.query(sqlUpdateMyPwd, [hashedPasswd, req.session.uid]);//새 비밀번호 설정
          })
        }
        
        res.redirect("mypage");//리다이렉트
        conn.release();
      })
    }
    catch(err){
      console.log("Error: MySQL returned ERROR : " + err);
      conn.release();
    }
  }
  else
  {
    res.send('<script>alert("로그인이 필요합니다.");location.href="login";</script>');
  }
    
  });

module.exports = router;
