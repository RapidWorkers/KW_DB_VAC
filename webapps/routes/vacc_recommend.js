var express = require('express');
var router = express.Router();
const getSqlConnectionAsync = require('../configs/mysql_load').getSqlConnectionAsync;

/* GET home page. */
router.get('/', function (req, res, next) {

  res.render('vacc_recommend', { title: '백신 추천' });
});


router.post('/', async function (req, res, next) {

  //부작용 1개도 없던 백신까지 전부 들고와야함 ㅇㅇ vaccine 이름에서 가져오기그냥 전부 Join해서 거대 table만들어버리고 싶다
  //min age에서 가장 작은 나이를 찾아 그것도 안 되면 안됨 result2로 가고, 아니면 잘 조정
  //열 나면 db 볼 필요도 없이 바로 render
  //가장 먼저 나이가 충족되어야하고, 그 다음이 부작용률 가장 낮은 백신
  //해당 백신의 이름, 접종 인원 (ischecked=1), 부작용 수, 부작용률을 계산 해서 render할 때 넘겨줌.
  //만약 아스트라제네카 부작용이 있던 사람이라면 그 백신을 제외한 나머지 백신으로 동일한 계산.
  //이 모든 걸 sql문과 자바 스크립트로 짜야함 개싫음
  //밥

  
  var sqlNestSub = "(SELECT RE.vaccine_type FROM RESERVATION AS RE JOIN RESERVE_REPORT AS VR ON VR.reserve_id = RE.id)";
  var sqlGetVaccSideNum = "SELECT vac_name, V.id AS vacc_id, COUNT(R.id) AS report_cnt FROM VACCINE AS V LEFT OUTER JOIN RESERVE_REPORT AS R ON V.id = " + sqlNestSub + "GROUP BY vac_name ORDER BY report_cnt;";
  var sqlGetVaccInfo = "SELECT COUNT(id) AS vaccined_cnt FROM RESERVATION where vaccine_type = ? AND is_complete = 1;";

  var birthday = new Date(req.body.birthdate);
  var vac_recommend_fever = req.body.vac_recommend_fever;
  var vac_recommend_sideeffect = req.body.vac_recommend_sideeffect;
  var vac_recommend_res, vaccined_num, vac_sideeffect_num, vac_sideeffect_rate;

  //만 나이 계산
  var today = new Date();
  var age = today.getFullYear() - birthday.getFullYear();
  var month = today.getMonth() - birthday.getMonth();
  
  if (month < 0 || (month === 0 && today.getDate() < birthday.getDate())) {
    age = age - 1;
  }
  
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

  var renderInfo = {
    title: '백신 결과',
    age,
    vac_recommend_fever,
    vac_recommend_sideeffect,
    vac_recommend_res,
    vaccined_num,
    vac_sideeffect_num,
    vac_sideeffect_rate
  };

  res.render('vacc_recommend_result1', renderInfo);
  
});

module.exports = router;
