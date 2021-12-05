var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  if(req.session.loggedin === 1) //check login
  {
    var renderInfo = {
      title: '그룹 목록 보기',
      loggedin: 1,
      legal_name: req.session.legal_name
    };
    
    res.render('group_list', renderInfo);
  }
  else
  {
    res.send('<script>alert("로그인이 필요합니다.");location.href="login";</script>');
  }
});


// 그룹 삭제는 API

module.exports = router;
