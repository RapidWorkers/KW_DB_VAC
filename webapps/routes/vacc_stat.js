var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('vacc_stat', { title: '백신 접종 통계 보기' , loggedin: +(req.session.loggedin === 1)});
});

module.exports = router;
