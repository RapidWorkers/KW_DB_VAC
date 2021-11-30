var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  if(req.session.loggedin === 1)
  {
    res.render('intro', { title: '백신 예약 시스템', loggedin: 1});
  }
  else
  {
    res.render('intro', { title: '백신 예약 시스템', loggedin: 0});
  }
  
});

module.exports = router;
