var express = require('express');
var router = express.Router();

/* GET home page. */
router.post('/', function(req, res, next) {
  if(req.session.loggedin === undefined  || req.session.loggedin ===0)
    res.send("<script>alert('로그인이 필요합니다.');location.href='login';</script>");
  else
    res.render('reserve_select_date', { title: '예약 날짜 선택', loggedin: 1});
});

module.exports = router;

