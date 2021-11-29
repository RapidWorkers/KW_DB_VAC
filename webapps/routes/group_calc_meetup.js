var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('group_calc_meetup', { title: 'Express' });
});

/* POST home page. */
/* result1, result2 조건문으로 나눠줘야 함 */
router.post('/', function(req, res, next) {
    res.render('group_calc_meetup_result1', { title: 'Express' });
  });

module.exports = router;
