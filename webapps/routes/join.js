var express = require('express');
var router = express.Router();
const getSqlConnection = require('../configs/mysql_load').getSqlConnection;
const getSqlConnectionAsync = require('../configs/mysql_load').getSqlConnectionAsync;
var bcrypt = require('bcrypt');

var nodemailer = require('nodemailer');
var mgTransport = require('nodemailer-mailgun-transport');
var mgCfg = require('../configs/mailgun_config.json');

/* GET home page. */
router.get('/', function(req, res, next) {
  if(req.session.loggedin === undefined || req.session.loggedin ===0)
  {
    var hasError = 0;
    if(req.query.hasError) hasError = parseInt(req.query.hasError);
    res.render('join', { title: '회원가입', loggedin: 0 , hasError});
  }
  else
  {
    res.send("<script>alert('잘못된 경로로 접근했습니다.');location.href='/';</script>");
  }
});


/* POST home page. */
router.post('/', async function(req, res, next) {

  var sqlChkUsernameDup = "SELECT count(*) as dup from USER where username = ?;";
  var sqlChkEmailDup = "SELECT count(*) as dup from USER where email = ?;";
  var sqlChkPhoneDup = "SELECT count(*) as dup from USER where phone = ?;";
  var sqlInsertUser = "INSERT INTO USER(username, passwd, legal_name, sex, birthdate, zip, address, address2, email, phone) VALUE(?,?,?,?,?,?,?,?,?,?);";
  var sqlGetAuthLink = "SELECT auth_link FROM EMAIL_AUTH where email = ?;"

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

    /* Data validation */
    var valResult = true;

    var phoneRegex = /^\d{2,3}-\d{3,4}-\d{4}$/;
    var emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    var zipRegex = /^\d{5}$/

    if(!username) valResult = false;
    if(!passwd) valResult = false;
    if(!legal_name) valResult = false;
    if(isNaN(Date.parse(birthdate))) valResult = false;
    if(sex != 0 && sex != 1) valResult = false;
    if(!zipRegex.test(zip)) valResult = false;
    if(!address) valResult = false;
    if(!emailRegex.test(email)) valResult = false;
    if(!phoneRegex.test(phone)) valResult = false;

    if(!valResult) return res.redirect('join?hasError=1');

    //Duplicated value check
    //ID 중복 확인
    try{
      var conn = await getSqlConnectionAsync();
      var [rows, fields] = await conn.query(sqlChkUsernameDup, [username]);
      
      if(rows[0].dup !== 0) res.redirect('join?hasError=2');
      conn.release();
    }
    catch(err){
        console.log("Error: MySQL returned ERROR: " + err);
        conn.release();
    }

    //핸드폰 번호 중복 확인
    try{
      var conn = await getSqlConnectionAsync();
      var [rows, fields] = await conn.query(sqlChkPhoneDup, [phone]);
      
      if(rows[0].dup !== 0) res.redirect('join?hasError=2');
      conn.release();
    }
    catch(err){
        console.log("Error: MySQL returned ERROR: " + err);
        conn.release();
    }

    //이메일 중복 확인
    try{
      var conn = await getSqlConnectionAsync();
      var [rows, fields] = await conn.query(sqlChkEmailDup, [email]);
      
      if(rows[0].dup !== 0) res.redirect('join?hasError=2');
      conn.release();
    }
    catch(err){
        console.log("Error: MySQL returned ERROR: " + err);
        conn.release();
    }

    //모든 데이터 검증이 끝난 후, 사용자 정보를 데이터베이스에 추가
    bcrypt.hash(passwd, 10, async (err, hashedPasswd) => {
      //암호화 이후 실행할 내용
      try{
        var conn = await getSqlConnectionAsync();
        var [rows, fields] = await conn.query(sqlInsertUser, [username, hashedPasswd, legal_name, sex, birthdate, zip, address, address2, email, phone]);

        [rows, fields] = await conn.query(sqlGetAuthLink, [email]);

        if(rows.length == 0) throw "CANNOT FIND ANY EMAIL MATCHED";

        var mailerOpt = {
          auth: {
            api_key: mgCfg.key,
            domain: mgCfg.domain
          }
        }

         //인증 메일 발송
        var mailerClient = await nodemailer.createTransport(mgTransport(mailerOpt));
        var emailContent = {
          from: mgCfg.from,
          to: email,
          subject: "회원가입 인증 이메일 입니다.",
          html: "아래 링크를 클릭하세요.<br><a href='"+mgCfg.base_url + "email_auth?auth_link=" + rows[0].auth_link+"'>"+mgCfg.base_url + "email_auth?auth_link=" + rows[0].auth_link+"</a>"
        }

        mailerClient.sendMail(emailContent);

        res.render('email_auth', { title: '이메일 인증', loggedin: 0, email: email});

      }
      catch(err){
        console.log("Error: MySQL returned ERROR: " + err);
      }
      finally{
        conn.release();
      }
    }); //비밀번호 암호화(), promise를 실행하겠다는 악속
    
  }
  else
  {
    res.send("<script>alert('잘못된 경로로 접근했습니다.');location.href='/';</script>");
  }
});

module.exports = router;