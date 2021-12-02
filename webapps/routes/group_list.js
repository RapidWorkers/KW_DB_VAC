var express = require('express');
var router = express.Router();
const getSqlConnection = require('../configs/mysql_load').getSqlConnection;

/* GET home page. */
router.get('/', function(req, res, next) {
  if(req.session.loggedin === 1) //check login
  {
    getSqlConnection((conn) => {
      var sqlGetGroupInfo = "SELECT * FROM TEAM WHERE owner_uid = ?;";
      conn.query(sqlGetGroupInfo, [req.session.uid], function (err, rows){
        if(err) console.log("Error: MySQL returned ERROR : " + err);
        else{
          var renderInfo = {
            title: '그룹 목록 보기',
            loggedin: 1,
            legal_name: req.session.legal_name,
            rows: rows
          };
          
          res.render('group_list', renderInfo);
        }
      })
    })
    
  }
  else
  {
    res.send('<script>alert("로그인이 필요합니다.");location.href="login";</script>');
  }
});

// 그룹 삭제는 API

module.exports = router;
