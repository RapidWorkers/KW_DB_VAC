var express = require('express');
var router = express.Router();

/* GET home page. */
router.post('/', function(req, res, next) {
  res.render('group_mem_info', { title: 'Express' });
});

module.exports = router;
