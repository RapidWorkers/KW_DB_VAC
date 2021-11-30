var express = require('express');
var router = express.Router();

/* GET home page. */
router.post('/', function(req, res, next) {
  if(req.session.loggedin === 1)
  {
    res.render('group_mem_info', { title: '친구 정보 보기', loggedin: 1, legal_name: req.session.legal_name});
  }
  else
  {
    res.send('<script>alert("로그인이 필요합니다.");location.href="login";</script>');
  }
});

module.exports = router;
