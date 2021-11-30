var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  
  if(req.session.loggedin === undefined || req.session.loggedin ===0)
  {
    res.send("<script>alert('로그인이 필요합니다.');location.href='/login';</script>");
  }
  else
  {
    res.render('left_vacc', { title: '잔여백신 예약', loggedin: 1, legal_name: req.session.legal_name});
  }
});


/* POST home page. */
router.post('/', function(req, res, next) {
  if(req.session.loggedin === undefined || req.session.loggedin ===0)
  {
    res.send("<script>alert('로그인이 필요합니다.');location.href='/login';</script>");
  }
  else
  {
    res.render('left_vacc_result', { title: '잔여백신 예약', loggedin: 1, legal_name: req.session.legal_name});
  }
  
});

module.exports = router;

