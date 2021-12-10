var express = require('express');
var router = express.Router();

/* GET page. */
router.get('/', function(req, res, next) {
  res.render('emergency', { title: '응급실 안내', loggedin: +(req.session.loggedin === 1), legal_name: req.session.legal_name});
});

module.exports = router;