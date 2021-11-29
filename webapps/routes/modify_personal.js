var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('modify_personal', { title: 'Express' });
});

/* GET home page. */
router.post('/', function(req, res, next) {
    res.render('modify_personal', { title: 'Express' });
  });

module.exports = router;
