var express = require('express');
var router = express.Router();
const getSqlConnectionAsync = require('../configs/mysql_load').getSqlConnectionAsync;

/* GET home page. */
router.get('/', function(req, res, next) {
if(req.session.loggedin === undefined || req.session.loggedin ===0)
  res.send("<script>alert('로그인이 필요합니다.');location.href='login';</script>");
else
  res.render('report', { title: '이상반응 신고' , loggedin: 1, legal_name: req.session.legal_name});
  
});

/* POST home page. */
router.post('/', function(req, res, next) {
if(req.session.loggedin === undefined || req.session.loggedin ===0)
  res.send("<script>alert('로그인이 필요합니다.');location.href='login';</script>");
else{
  const {report} = req.body;
  console.log(report);
  res.render('report_result', { title: '이상반응 신고 완료', loggedin: 1, legal_name: req.session.legal_name});
}
  
});

module.exports = router;