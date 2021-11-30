var express = require('express');
var router = express.Router();
const getSqlConnection = require('../configs/mysql_load');

/* GET home page. */
router.get('/', function(req, res, next) {
  if(req.session.loggedin === 1)//check login
  {
    
    res.render('mypage', { title: '내 정보 보기', loggedin: 1, legal_name: req.session.legal_name});
  }
  else
  {
    res.send('<script>alert("로그인이 필요합니다.");location.href="login";</script>');
  }
});

module.exports = router;
