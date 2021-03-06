var express = require('express');
var router = express.Router();



router.post('/', function(req, res, next) {
  if(req.session.loggedin === undefined  || req.session.loggedin ===0){
    res.send("<script>alert('로그인이 필요합니다.');location.href='login';</script>");
  }
  else{

     //해당 병원에서 예약할 수 있는 백신 정보를 가져와 화면에 출력
    var hospital_id = req.body.hospital_id;
    var hospital_name = req.body.hospital_name;
    var reserveChange = req.body.reserveChange;
   
    var renderInfo = {
      title: '예약 날짜 선택',
      legal_name: req.session.legal_name,
      loggedin: 1,
      hospital_id : hospital_id,
      hospital_name: hospital_name,
      reserveChange: reserveChange
    };

    res.render('reserve_select_date', renderInfo);
  }
});

module.exports = router;

