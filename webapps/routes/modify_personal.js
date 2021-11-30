var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  if(req.session.loggedin === 1)
  {
    res.render('modify_personal', { title: '내 정보 바꾸기', loggedin: 1, legal_name: req.session.legal_name});
  }
  else
  {
    res.send('<script>alert("로그인이 필요합니다.");location.href="login";</script>');
  }
  
});

/* GET home page. */
router.post('/', function(req, res, next) {
  if(req.session.loggedin === 1)
  {
    res.render('modify_personal', { title: 'Express', loggedin: 1, legal_name: req.session.legal_name});//놔둡시다 로직처리 할거라
  }
  else
  {
    res.send('<script>alert("로그인이 필요합니다.");location.href="login";</script>');
  }
    
  });

module.exports = router;
