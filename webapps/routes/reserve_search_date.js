var express = require('express');
var router = express.Router();

/* GET home page. */
router.post('/', function(req, res, next) {
  res.render('reserve_serach_hosp', { title: 'Express' });
});

module.exports = router;
  