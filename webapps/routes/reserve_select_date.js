var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('reserve_select_date', { title: 'Express' });
});

router.post('/', function(req, res, next) {
  res.render('reserve_confirm', { title: 'Express' });
});

module.exports = router;
  