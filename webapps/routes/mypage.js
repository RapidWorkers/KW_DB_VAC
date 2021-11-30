var express = require('express');
var router = express.Router();
const getSqlConnection = require('../configs/mysql_load');

/* GET home page. */
router.get('/', function(req, res, next) {
  if(req.session.loggedin === 1)//check login
  {
    getSqlConnection((conn) => {
      var sqlGetUserInfo = "SELECT sex, birthdate, address, email, phone from USER where uid = ?;";
      conn.query(sqlGetUserInfo, [req.session.uid], function (err, rows) {
        if (err) console.err("Error: MySQL returned ERROR : " + err);
        else{
          var bdate = new Date(rows[0].birthdate);

          var renderInfo = {
            title: '내 정보 보기',
            loggedin: 1,
            legal_name: req.session.legal_name,
            sex: (rows[0].sex === 1)?"여자":"남자",
            byear:bdate.getFullYear(),
            bmonth:bdate.getMonth().toString().padStart(2,"0"),
            bday:bdate.getDay().toString().padStart(2,"0"),
            phone: rows[0].phone,
            email: rows[0].email,
            address: rows[0].address
          };

          res.render('mypage', renderInfo);
        }
      })

      //Release connection
      conn.release();
    })
  }
  else
  {
    res.send('<script>alert("로그인이 필요합니다.");location.href="login";</script>');
  }
});

module.exports = router;
