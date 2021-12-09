var express = require('express');
var router = express.Router();
const getSqlConnectionAsync = require('../configs/mysql_load').getSqlConnectionAsync;

/* GET home page. */
router.get('/:gid/:id', async function(req, res, next) {
  if(req.session.loggedin === 1)
  {
    // 프로필 이미지, 이름, 그루ㅂ이름, 접종여부, 백신 접종 종류, 접종일

    var sqlValInfo = "SELECT T.id, M.uid, T.team_name FROM TEAM T JOIN TEAM_MEM M ON T.owner_uid= ? AND T.id=M.gid AND M.uid = ? AND T.id=?;"
    var sqlGetUserInfo = "SELECT legal_name, sex, birthdate, profile_img from USER where uid = ?;";
    var sqlGetVaccinatedSeries = "SELECT Vaccinated from USER_VACCINATED where uid = ?;";
    var sqlGetFirstDoseInfo = "SELECT V.vac_name, R.reserve_date FROM RESERVATION R INNER JOIN VACCINE V ON R.vaccine_type = V.id WHERE uid = ? and current_series = 1;";
    var sqlGetSecondDoseInfo = "SELECT V.vac_name, R.reserve_date FROM RESERVATION R INNER JOIN VACCINE V ON R.vaccine_type = V.id WHERE uid = ? and current_series = 2;";
    
    try{
      var conn = await getSqlConnectionAsync();
      
      // 그룹아이디(gid), 사용자아이디(uid) 검증
      var [vals, fields] = await conn.query(sqlValInfo, [req.session.uid, req.params.id, req.params.gid]);
      
      if(vals.length==0){
        conn.release();
        return res.send('<script>alert("잘못된 경로로 접근하였습니다.");location.href="/group_mem_list/'+req.params.gid+'";</script>'); 
      }
      
      var [rows, fields] = await conn.query(sqlGetUserInfo, [vals[0].uid]);

      var renderInfo = {
        title: '내 정보 보기',
        loggedin: 1,
        legal_name: req.session.legal_name,
        friend_legal_name: rows[0].legal_name,
        team_name: vals[0].team_name,
        sex: (rows[0].sex === 1)?"여자":"남자",
        profile_img: (rows[0].profile_img === null)?-1:rows[0].profile_img,
        vaccineDate: "-"
      };

      [rows, fields] = await conn.query(sqlGetVaccinatedSeries, [vals[0].uid]);
      renderInfo.vaccinatedStatus = rows[0].Vaccinated;

      [rows, fields] = await conn.query(sqlGetFirstDoseInfo, [vals[0].uid]);
      if(rows.length != 0)//vaccine reservation first
      {
        renderInfo.firstVaccineName = rows[0].vac_name;
        renderInfo.first_reserve_date = rows[0].reserve_date;
        var vDate = new Date(rows[0].reserve_date);
        renderInfo.vaccineDate = vDate.getFullYear() + '. ' + (vDate.getMonth()+1).toString().padStart(2,"0") + '. ' + (vDate.getDate()).toString().padStart(2,"0") + '.';
      }
      else//no reservation
      {
        renderInfo.firstVaccineName = "-";
        renderInfo.first_reserve_date = null;
      }

      [rows, fields] = await conn.query(sqlGetSecondDoseInfo, [vals[0].uid]);
      if(rows.length != 0)//No vaccine reservation
      {
        renderInfo.secondVaccineName = rows[0].vac_name;
        renderInfo.second_reserve_date = rows[0].reserve_date;
        var vDate = new Date(rows[0].reserve_date);
        renderInfo.vaccineDate = vDate.getFullYear() + '. ' + (vDate.getMonth()+1).toString().padStart(2,"0") + '. ' + (vDate.getDate()).toString().padStart(2,"0") + '.';
      }
      else
      {
        renderInfo.secondVaccineName = "-";
        renderInfo.second_reserve_date = null;
      }
      res.render('group_mem_info', renderInfo);
      conn.release();

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
