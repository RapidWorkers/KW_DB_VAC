var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  if(req.session.loggedin === undefined  || req.session.loggedin ===0)
    res.send("<script>alert('로그인이 필요합니다.');location.href='login';</script>");
  else
    res.render('vacc_recommend', { title: '백신 추천', loggedin: 1});
});

module.exports = router;
