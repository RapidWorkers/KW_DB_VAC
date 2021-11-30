var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  if(req.session.loggedin === undefined || req.session.loggedin ===0)
    res.send("<script>alert('로그인이 필요합니다.');location.href='login';</script>");
  else
    res.render('group_calc_meetup', { title: '모임 계산기', loggedin: 1, legal_name: req.session.legal_name});
  
});

/* POST home page. */
/* result1, result2 조건문으로 나눠줘야 함 */
router.post('/', function(req, res, next) {
  if(req.session.loggedin === undefined || req.session.loggedin ===0)
    res.send("<script>alert('로그인이 필요합니다.');location.href='login';</script>");
  else
    res.render('group_calc_meetup_result1', { title: '결과 1', loggedin: 1, legal_name: req.session.legal_name});
  });

module.exports = router;
