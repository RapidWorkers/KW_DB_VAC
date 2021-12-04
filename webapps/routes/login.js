var express = require('express');
var router = express.Router();
const getSqlConnectionAsync = require('../configs/mysql_load').getSqlConnectionAsync;
var bcrypt = require('bcrypt');

/* GET home page. */
router.get('/', function (req, res, next) {
  var hasError = 0;
  if(req.query.hasError) hasError = parseInt(req.query.hasError);

  if (req.session.loggedin === undefined)
    res.render('login', { title: '로그인', hasError});
  else {
    res.send("<script>alert('이미 로그인 되었습니다.');location.href='/';</script>");
  }
});

router.post('/', async function (req, res, next) {
  var username = req.body.username;   //뒤의 username은 form에서의 name
  var passwd = req.body.passwd;

  if (req.session.loggedin === 1) {
    res.send("<script>alert('잘못된 경로로 접근했습니다!');</script>");
  }
  else {

    var sqlGetPwdofUser = "SELECT uid, legal_name, passwd from USER where username = ?;";
    var sqlChkActivatedUser = "SELECT E.is_used FROM EMAIL_AUTH E INNER JOIN USER U ON E.email = U.email WHERE U.uid = ?;";

    if(!username || !username.length || !passwd || !passwd.length)
    {
      return res.redirect("login?hasError=3");
    }

    try{
      var conn = await getSqlConnectionAsync();

      var [rows, fields] = await conn.query(sqlGetPwdofUser, [username]);
      if(!rows.length) 
      {
        conn.release();
        return res.redirect("login?hasError=1");//re-login
      }

      //Compare user password with saved password
      bcrypt.compare(passwd, rows[0].passwd, async (err, isMatched) => {
        if (err) console.log("Error: bcrypt returned ERROR : " + err);//bcrypt error
        else {
          if (isMatched) {//password match

            /*
            TODO: Check activated user
            */
            [activated, fields] = await conn.query(sqlChkActivatedUser, [rows[0].uid]);
            console.log(activated[0].is_used);
            if(activated[0].is_used != 1)
            {
              conn.release();
              return res.redirect("login?hasError=2");
            }

            /* NOTE: 자주 쓰는 정보는 Session에 담아두기, 매번 Query 요청은 성능 저하 */
            req.session.loggedin = 1;//then login
            req.session.uid = rows[0].uid;//set uid to use later
            req.session.legal_name = rows[0].legal_name;//set name to use later
            
            res.redirect("/");
          }
          else {//otherwise
            res.redirect("login?hasError=1");//re-login
          }
        }
      })

    }
    catch(err){
      console.log("Error: MySQL returned ERROR : " + err);
      conn.release();
    }
  }
})

module.exports = router;

