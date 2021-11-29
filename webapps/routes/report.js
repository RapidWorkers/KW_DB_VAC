var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('report', { title: 'Express' });
});

/* POST home page. */
router.post('/', function(req, res, next) {
    res.render('report_result', { title: 'Express' });
  });

module.exports = router;