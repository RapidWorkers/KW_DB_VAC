var express = require('express');
var router = express.Router();

/* POST reserve confirm(백신 예약완료 페이지) */

//~~~/reserve_confirm/reserve_confirm
//잔여백신 예약 완료 페이지와 동일한 화면이여서 재사용
router.post('/', function(req, res, next) {
  if(req.session.loggedin === undefined || req.session.loggedin ===0)
  {
    res.send("<script>alert('로그인이 필요합니다.');location.href='/login';</script>");
  }
  else
  {
    res.render('reserve_confirm', { title: '백신 예약완료', loggedin: 1, legal_name: req.session.legal_name});
  }
  
});

module.exports = router;