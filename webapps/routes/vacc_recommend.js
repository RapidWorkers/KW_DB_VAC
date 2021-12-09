var express = require('express');
var router = express.Router();
const getSqlConnectionAsync = require('../configs/mysql_load').getSqlConnectionAsync;

/* GET home page. */
router.get('/', function (req, res, next) {

  res.render('vacc_recommend', { title: '백신 추천', loggedin: +(req.session.loggedin === 1), legal_name: req.session.legal_name});
});


router.post('/', async function (req, res, next) {

  var birthday = new Date(req.body.birthdate);
  var vac_recommend_fever = req.body.vac_recommend_fever;
  var vac_recommend_sideeffect = req.body.vac_recommend_sideeffect;
  var vac_recommend_name, vaccined_num, vac_sideeffect_num, vac_sideeffect_rate;

  if(!birthday || !vac_recommend_fever || !vac_recommend_sideeffect)
  {
    res.send("<script>alert('잘못된 경로로 접근했습니다!');location.href='/';</script>");
  }

  //만 나이 계산
  var today = new Date();
  var age = today.getFullYear() - birthday.getFullYear();
  var month = today.getMonth() - birthday.getMonth();
  
  if (month < 0 || (month === 0 && today.getDate() < birthday.getDate())) {
    age = age - 1;
  }

  //sql
  var sqlCountVaccinedCnt = "SELECT COUNT(id) AS vaccined_cnt, vaccine_type FROM RESERVATION WHERE is_complete = 1 GROUP BY vaccine_type";
  var sqlCountReportCnt = "SELECT COUNT(DISTINCT VR.reserve_id) AS report_cnt, RE.vaccine_type FROM RESERVATION AS RE LEFT OUTER JOIN VACC_REPORT AS VR ON VR.reserve_id = RE.id GROUP BY RE.vaccine_type";
  var sqlSubQuery = "SELECT A.vaccined_cnt, B.report_cnt, B.vaccine_type FROM ( "+sqlCountVaccinedCnt+ " ) AS A JOIN ( " +sqlCountReportCnt+ " ) AS B ON A.vaccine_type = B.vaccine_type";
  var sqlGetVaccInfo = "WITH VACC_INFO AS (SELECT S.report_cnt, S.vaccined_cnt, (S.report_cnt / S.vaccined_cnt) AS report_rate, S.vaccine_type, V.vac_name, V.min_age FROM ( "+sqlSubQuery+ " ) AS S JOIN VACCINE AS V ON S.vaccine_type = V.id)"; 
  
  var sqlCheckMinAge = "SELECT * FROM VACC_INFO WHERE min_age < ? ORDER BY report_rate, vaccined_cnt DESC;"
  //var sqlDeleteVacc = "DELETE FROM VACC_INFO WHERE vac_name like "+"아스트라제네카" +";";
  var sqlGetPossibleVacc = sqlGetVaccInfo + sqlCheckMinAge;

  //renderinfo
  var renderInfo = {
    title: '백신 결과',
    loggedin: +(req.session.loggedin === 1),
    legal_name: req.session.legal_name,
    age,
    vac_recommend_fever,
    vac_recommend_sideeffect,
  };

  //고열 시 백신 접종 불가
  if(vac_recommend_fever === "yes"){
    res.render('vacc_recommend_result2', renderInfo);
  }
  else{
    try{
      var conn = await getSqlConnectionAsync();
      var [rows, fields] = await conn.query(sqlGetPossibleVacc, [age]);

      //해당 나이에 맞을 수 있는 백신 없음.
      if(!rows.length) 
      {
        conn.release();
        return res.render('vacc_recommend_result2', renderInfo);
      }

        //아스트라제네카 부작용 있는 사람은 해당 백신 접종 불가.
      var checked = 0;
      if (vac_recommend_sideeffect === "yes" && (rows[0].vac_name ==="아스트라제네카" || rows[0].vac_name === "얀센")) {
        if(rows.length == 1){
          conn.release();
          return res.render('vacc_recommend_result2', renderInfo);
        }
        else
          checked = 1;
      }

      //가장 부작용률이 적은 백신을 추천. 만약 부작용률이 같을 시, 접종인원이 많은 백신을 추천

      vac_recommend_name = rows[checked].vac_name;
      vac_sideeffect_num = rows[checked].report_cnt;
      vaccined_num = rows[checked].vaccined_cnt;
      vac_sideeffect_rate = rows[checked].report_rate;

      var renderInfo = {
        title: '백신 결과',
        loggedin: +(req.session.loggedin === 1),
        legal_name: req.session.legal_name,
        age,
        vac_recommend_fever,
        vac_recommend_sideeffect,
        vac_recommend_name,
        vaccined_num,
        vac_sideeffect_num,
        vac_sideeffect_rate
      };

      conn.release();
      res.render('vacc_recommend_result1', renderInfo);

    }catch(err){
      console.log("Error: MySQL returned ERROR : " + err);
      conn.release();
    }
  }
  /*
  var sqlNestSub = "(SELECT RE.vaccine_type FROM RESERVATION AS RE JOIN RESERVE_REPORT AS VR ON VR.reserve_id = RE.id)";
  var sqlGetVaccSideNum = "SELECT vac_name, V.id AS vacc_id, COUNT(R.id) AS report_cnt FROM VACCINE AS V LEFT OUTER JOIN RESERVE_REPORT AS R ON V.id = " + sqlNestSub + "GROUP BY vac_name ORDER BY report_cnt;";
  var sqlGetVaccInfo = "SELECT COUNT(id) AS vaccined_cnt FROM RESERVATION where vaccine_type = ? AND is_complete = 1;";

  
  try{
    var conn = getSqlConnectionAsync();
    var [rows, fields] = await conn.query(sqlGetVaccSideNum, []);

    var checked = 0;
    if (vac_recommend_sideeffect === "yes" && rows[0].vac_name === "아스트라제네카") {
      checked = 1;
    }

    var [subrows, fields] = await conn.query(sqlGetVaccInfo, [rows[checked].vacc_id]);
    vaccined_num = subrows[0].vaccined_cnt;

    vac_recommend_res = rows[checked].vac_name;
    vac_sideeffect_num = rows[checked].report_cnt;
    vac_sideeffect_rate = vac_sideeffect_num / vaccined_num;

    conn.release();
  }catch(err){
    console.log("Error: MySQL returned ERROR : " + err);
    conn.release();
  }
*/
  
});

module.exports = router;
