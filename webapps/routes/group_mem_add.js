var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('group_mem_add', { title: 'Express' });
});

/* POST home page. */
router.post('/', function(req, res, next) {
    res.render('group_mem_add', { title: 'Express' });
  });

module.exports = router;
