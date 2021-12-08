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
// 사람수 6명 초과 || 미접종자 2명 이상

router.post('/', async function(req, res, next) {
  if(req.session.loggedin === undefined || req.session.loggedin ===0)
    res.send("<script>alert('로그인이 필요합니다.');location.href='login';</script>");
  else{
    

    // 미접종인원 몇명인지 count
    //var sqlGetUnVacCount = "SELECT COUNT(*) AS VAC FROM USER_VACCINATED WHERE uid IN (?,?,?) AND Vaccinated !='FULL'";

    try{
      var chkPerson = req.body.group_calc;

      if(!Array.isArray(chkPerson))
      {
        chkPerson = [chkPerson];
      }

      chkPerson.push(req.session.uid);
      console.log(chkPerson);
      
      var len=Object.keys(chkPerson).length;
      var flag = true; // 모임계산기 결과 true면 모임 가능, false면 모임불가능

      
      console.log(len);
      var conn = await getSqlConnectionAsync();
      // 멍청한 코드
      var unVacCnt = 0;
      
      var sqlChkVac = "SELECT uid FROM USER_VACCINATED WHERE uid = ? AND Vaccinated COLLATE utf8mb4_general_ci != 'FULL';";
      for (var i=0;i<len;i++){
        
        var [rows, fields] = await conn.query(sqlChkVac, [Number(chkPerson[i])]);
        if(rows.length)
          unVacCnt += 1;
      }

      //var [rows, fields] = await conn.query(sqlGetUnVacCount, [1,2,3]);
  

      // 사람 수 6명 초과이거나 미접종자 1명 초과이면 모임 불가능
      if(len > 6 || unVacCnt > 1)
        flag = false;

      console.log(flag);

      var renderInfo = {
        title: '모임 계산 결과',
        legal_name: req.session.legal_name,
        loggedin: 1,
        flag: flag
      };
      res.render('group_calc_meetup_result', renderInfo);
    }catch(err){
      console.log("Error: MySQL returned ERROR :" + err);
      conn.release();
    }
   
  }
  });

module.exports = router;
