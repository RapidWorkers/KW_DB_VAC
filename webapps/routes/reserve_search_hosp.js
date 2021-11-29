var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('reserve_search_hosp', { title: 'Express' });
});

module.exports = router;
  