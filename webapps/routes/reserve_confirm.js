var express = require('express');
var router = express.Router();

/* POST reserve confirm(백신 예약완료 페이지) */

//~~~/reserve_confirm/reserve_confirm
//잔여백신 예약 완료 페이지와 동일한 화면이여서 재사용
router.post('/', function(req, res, next) {
  res.render('reserve_confirm', { title: 'Express' });
});

module.exports = router;