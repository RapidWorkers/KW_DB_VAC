var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  if(req.session.loggedin === undefined  || req.session.loggedin ===0)
    res.send("<script>alert('로그인이 필요합니다.');location.href='login';</script>");
  else
    res.render('vacc_recommend', { title: '백신 추천', loggedin: 1, legal_name: req.session.legal_name});
});


router.post('/', function(req, res, next) {
  if(req.session.loggedin === undefined  || req.session.loggedin ===0)
    res.send("<script>alert('로그인이 필요합니다.');location.href='login';</script>");
  else{
    var vac_recommend_age = req.body.vac_recommend_age;
    var vac_recommend_fever =  req.body.vac_recommend_fever;
    var vac_recommend_sideeffect = req.body.vac_recommend_sideeffect;

    var renderInfo = {
      title: '백신 결과',
      loggedin: 1,
      legal_name: req.session.legal_name,
      vac_recommend_age,
      vac_recommend_fever,
      vac_recommend_sideeffect
    };
    
    if(vac_recommend_age === "no" || vac_recommend_fever === "yes"){
      res.render('vacc_recommend_result2',renderInfo);
    }
    else{
        res.render('vacc_recommend_result1',renderInfo);
    }
  }
    
});
module.exports = router;
