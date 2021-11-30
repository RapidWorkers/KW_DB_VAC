var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('side_effect_stat', { title: '부작용 통계 보기', loggedin: +(req.session.loggedin === 1), legal_name: req.session.legal_name});
});

module.exports = router;
