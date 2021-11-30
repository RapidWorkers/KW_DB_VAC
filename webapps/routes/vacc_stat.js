var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('vacc_stat', { title: 'Express' , loggedin: (req.session.loggedin === 1)});
});

module.exports = router;
