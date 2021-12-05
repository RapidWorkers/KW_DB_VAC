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
    // TEAM_MEM에서 gid=TEAM.id에 IN인 사람들의 uid를 전부 얻어와서 
    // USER_VACCINATED 뷰에서 Vaccinated 여부 판단(FULL이면 접종자, 그 외에는 미접종자 취급)
    // 체크 사람 수가 6개 초과 || 체크된 사람 중 미접종자 1명 초과 이면 실패, 아니면 성공


    // GET에선 gid, team_name, uid, legal_name 
    
    var sqlGetAllTeamMemInfo = "SELECT U.legal_name, M.uid, T.team_name, M.gid  FROM TEAM T, TEAM_MEM M, USER U WHERE U.uid=M.uid AND T.id = M.gid AND M.gid IN (SELECT T.id FROM TEAM T WHERE owner_uid = ?);";

    
    try{
      var conn = await getSqlConnectionAsync();

      var [rows, fields] = await conn.query(sqlGetAllTeamMemInfo, [req.session.uid]);
      var renderInfo = {
        title: '모임 계산기',
        loggedin: 1,
        legal_name: req.session.legal_name,
        rows: rows
      }
      conn.release();
      res.render('group_calc_meetup', renderInfo);

    }catch(err){
      console.log("Error: MySQL returned ERROR :" + err);
      conn.release();
    }
  }
});

/* POST home page. */
// 사람수 6명 초과 || 미접종자 2명 초과
//
/* result1, result2 조건문으로 나눠줘야 함 */
router.post('/', async function(req, res, next) {
  if(req.session.loggedin === undefined || req.session.loggedin ===0)
    res.send("<script>alert('로그인이 필요합니다.');location.href='login';</script>");
  else
    res.render('group_calc_meetup_result1', { title: '결과 1', loggedin: 1, legal_name: req.session.legal_name});
  });

module.exports = router;
