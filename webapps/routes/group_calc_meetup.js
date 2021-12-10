var express = require('express');
var router = express.Router();
const getSqlConnectionAsync = require('../configs/mysql_load').getSqlConnectionAsync;

/* GET home page. */
router.get('/', async function(req, res, next) {
  if(req.session.loggedin === undefined || req.session.loggedin ===0)
    res.send("<script>alert('로그인이 필요합니다.');location.href='login';</script>");
  else
  {
    // GET에선 gid, team_name, uid, legal_name 
    
    var sqlGetAllTeamMemInfo = "SELECT U.legal_name, M.uid, count(M.uid) as dupCnt, T.team_name, M.gid  FROM TEAM T, TEAM_MEM M, USER U WHERE U.uid=M.uid AND T.id = M.gid AND M.gid IN (SELECT T.id FROM TEAM T WHERE owner_uid = ?) GROUP BY uid;";

    
    try{
      var conn = await getSqlConnectionAsync();

      var [rows, fields] = await conn.query(sqlGetAllTeamMemInfo, [req.session.uid]);//내가 가지는 모든 친구의 정보 가져오기
      var renderInfo = {
        title: '모임 계산기',
        loggedin: 1,
        legal_name: req.session.legal_name,
        rows: rows
      }//렌더링 정보

      conn.release();
      res.render('group_calc_meetup', renderInfo);//렌더링

    }catch(err){
      console.log("Error: MySQL returned ERROR :" + err);
      conn.release();
    }
  }
});

/* POST home page. */
// 사람수 6명 초과 || 미접종자 2명 이상

router.post('/', async function(req, res, next) {
  if(req.session.loggedin === undefined || req.session.loggedin ===0)
    res.send("<script>alert('로그인이 필요합니다.');location.href='login';</script>");
  else{
    try{
      var chkPerson = req.body.group_calc;

      if(chkPerson == undefined) chkPerson = [req.session.uid];//아무도 선택 안하면 나만 넣기
      else
      {
        if(!Array.isArray(chkPerson))//한명만 있으면
        {
          chkPerson = [chkPerson];//배열로 만들기
        }
        chkPerson.push(req.session.uid);//배열에 원소 계속 추가
      }
      
      var len=Object.keys(chkPerson).length;
      var flag = true; // 모임계산기 결과 true면 모임 가능, false면 모임불가능
      
      var conn = await getSqlConnectionAsync();
      var unVacCnt = 0;
      
      var sqlChkVac = "SELECT uid FROM USER_VACCINATED WHERE uid = ? AND Vaccinated COLLATE utf8mb4_general_ci != 'FULL';";
      for (var i=0;i<len;i++){//모든 친구에 대해서
        var [rows, fields] = await conn.query(sqlChkVac, [Number(chkPerson[i])]);//접종여부 가져오기 특정인
        if(rows.length)
          unVacCnt += 1;
      }

      // 사람 수 6명 초과이거나 미접종자 1명 초과이면 모임 불가능
      if(len > 6 || unVacCnt > 1)
        flag = false;

      var renderInfo = {
        title: '모임 계산 결과',
        legal_name: req.session.legal_name,
        loggedin: 1,
        flag: flag
      };//렌더링 정보
      res.render('group_calc_meetup_result', renderInfo);//렌더링
    }catch(err){
      console.log("Error: MySQL returned ERROR :" + err);
      conn.release();
    }
   
  }
  });

module.exports = router;
