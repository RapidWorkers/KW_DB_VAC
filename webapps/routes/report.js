var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
if(req.session.loggedin === undefined || req.session.loggedin ===0)
  res.send("<script>alert('로그인이 필요합니다.');location.href='login';</script>");
else
  res.render('report', { title: '이상반응 신고' , loggedin: 1});
  
});

/* POST home page. */
router.post('/', function(req, res, next) {
if(req.session.loggedin === undefined || req.session.loggedin ===0)
  res.send("<script>alert('로그인이 필요합니다.');location.href='login';</script>");
else
  res.render('report_result', { title: '이상반응 신고 완료', loggedin: 1 });
});

module.exports = router;