var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  if(req.session.loggedin === undefined || req.session.loggedin === 0)
  {
    res.render('email_auth_finish', { title: '회원가입 완료', loggedin: 0 });
  }
  else
  {
    res.send("<script>alert('잘못된 경로로 접근했습니다.');location.href='/';</script>");
  }
});

module.exports = router;

