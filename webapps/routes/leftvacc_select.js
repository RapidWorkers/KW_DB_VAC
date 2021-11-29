var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('left_vacc', { title: 'Express' });
});


/* POST home page. */
router.post('/', function(req, res, next) {
  res.render('left_vacc_result', { title: 'Express' });
});

module.exports = router;

