var express = require('express');
var router = express.Router();
const getSqlConnectionAsync = require('../configs/mysql_load').getSqlConnectionAsync;

/* GET home page. */
router.get('/', async function(req, res, next) {
  if(req.session.loggedin === undefined || req.session.loggedin ===0)
    res.send("<script>alert('로그인이 필요합니다.');location.href='login';</script>");
  else
  {
    // TEAM에서 owner_uid = req.session.uid인 사람들의 id(gid), team_name 갖고오기
    // TEAM_MEM에서
    var sqlAllTeamMem = "SELECT team_name, gid, legal_name, uid FROM;";
    
    try{
      var conn = await getSqlConnectionAsync();
      var renderInfo = {
        title: '모임 계산기',
        loggedin: 1,
        legal_name: req.session.legal_name


      }
      conn.release();
      res.render('group_calc_meetup', { title: '모임 계산기', loggedin: 1, legal_name: req.session.legal_name});
    }catch(err){
      console.log("Error: MySQL returned ERROR :" + err);
      conn.release();
    }
    
  }
    
  
});

/* POST home page. */
/* result1, result2 조건문으로 나눠줘야 함 */
router.post('/', async function(req, res, next) {
  if(req.session.loggedin === undefined || req.session.loggedin ===0)
    res.send("<script>alert('로그인이 필요합니다.');location.href='login';</script>");
  else
    res.render('group_calc_meetup_result1', { title: '결과 1', loggedin: 1, legal_name: req.session.legal_name});
  });

module.exports = router;
