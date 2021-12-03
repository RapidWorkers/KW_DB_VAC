var express = require('express');
var router = express.Router();

/* GET home page. */
router.post('/', function(req, res, next) {
  if(req.session.loggedin === undefined  || req.session.loggedin ===0){
    res.send("<script>alert('로그인이 필요합니다.');location.href='login';</script>");
    var happy= req.query.body.hospital_name;
  }
  else{
    var hospital_name = req.body.hospital_name;

    var renderInfo = {
      title: '예약 날짜 선택',
      legal_name: req.session.legal_name,
      loggedin: 1,
      hospital_name: hospital_name
    };

    res.render('reserve_select_date', renderInfo);
  }
});

module.exports = router;

