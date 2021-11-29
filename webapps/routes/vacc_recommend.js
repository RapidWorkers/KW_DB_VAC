var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('vacc_recommend', { title: 'Express' });
});

module.exports = router;

//result1,2 divide
router.post('/', function(req, res, next) {

    res.render('vacc_recommend_result1', { title: 'Express' });
  });
  
  module.exports = router;
  
