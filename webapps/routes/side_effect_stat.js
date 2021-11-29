var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('side_effect_stat', { title: 'Express' });
});

module.exports = router;
