var express = require('express');
var router = express.Router();
const getSqlConnectionAsync = require('../configs/mysql_load').getSqlConnectionAsync;

/* GET home page. */
router.get('/:gid/:id', async function(req, res, next) {
  if(req.session.loggedin === 1)
  {
    // 프로필 이미지, 이름, 그루ㅂ이름, 접종여부, 백신 접종 종류, 접종일

    var sqlValInfo = "SELECT T.id, M.uid, T.team_name FROM TEAM T JOIN TEAM_MEM M ON T.owner_uid= ? AND T.id=M.gid AND M.uid = ? AND T.id=?;"
    var sqlGetMemInfo = "SELECT uid, legal_name, profile_img FROM USER WHERE uid=?"
    var sqlGetMemVacInfo = "SELECT DISTINCT R.reserve_date, R.vaccine_type, R.current_series, R.is_complete, V.Vaccinated, VV.vac_name FROM RESERVATION R, USER_VACCINATED V, VACCINE VV WHERE R.uid = ? AND V.uid=R.uid AND V.vaccine_type=VV.id ORDER BY reserve_date DESC;"
    
    try{
      var conn = await getSqlConnectionAsync();
      
      // 그룹아이디(gid), 사용자아이디(uid) 검증
      var [vals, fields] = await conn.query(sqlValInfo, [req.session.uid, req.params.id, req.params.gid]);
      
      if(vals.length==0){
        conn.release();
        return res.send('<script>alert("잘못된 경로로 접근하였습니다.");location.href="/group_mem_list/'+req.params.gid+'";</script>'); 
      }
      
      console.log(req.params.gid);
      console.log(req.params.id);
      var [rows, fields] = await conn.query(sqlGetMemInfo, [req.params.id]);
      var [vacs, fields] = await conn.query(sqlGetMemVacInfo, [req.params.id]);
      if(vacs.length==0){
        // 백신 접종내역 없을 때 예외처리
       
      }
      else{
        
        var renderInfo = {
          title: '친구 정보 보기',
          loggedin: 1, 
          legal_name: req.session.legal_name,
          rows: rows,
          vacs: vacs,
          vals: vals
        }

      }
      console.log(vacs);

      
      res.render('group_mem_info', renderInfo);

    }catch(err){
      console.log("Error: MySQL returned ERROR :" + err);
      conn.release();
    }
  }
  else
  {
    res.send('<script>alert("로그인이 필요합니다.");location.href="login";</script>');
  }
});

module.exports = router;
