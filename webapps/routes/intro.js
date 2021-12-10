var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  if(req.session.loggedin === 1)  //로그인을 한 경우
  {
    res.render('intro', { title: '백신 예약 시스템', loggedin: 1, legal_name: req.session.legal_name});
  }
  else  //로그인을 안 한 경우
  {
    res.render('intro', { title: '백신 예약 시스템', loggedin: 0});
  }
  
});

module.exports = router;
