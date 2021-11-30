var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  if(req.session !== undefined)//always destroy session, unless it is not defined
  {
    req.session.destroy();//destroy
  }
  res.redirect('/');//redirect
});

module.exports = router;
