var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  console.log(req.session.loggedin === 1);
  res.render('emergency', { title: '응급실 안내', loggedin: (req.session.loggedin === 1)});
});

module.exports = router;