var express = require('express');
var router = express.Router();

const getSqlConnectionAsync = require('../../configs/mysql_load').getSqlConnectionAsync;

router.get('/', async function(req, res, next){
    //백신 별, 부작용 수를 가져옴
    var sqlCountReportCnt = "SELECT VR.report_type, COUNT(*) AS report_cnt FROM RESERVATION AS RE RIGHT OUTER JOIN VACC_REPORT AS VR ON VR.reserve_id = RE.id WHERE RE.vaccine_type=? GROUP BY VR.report_type";
    
    var vaccine_id = req.query.vaccine_id;
    if(!vaccine_id) return res.json({success: false});//안 줬으면 에러

    try{
        var conn = await getSqlConnectionAsync();
        var [rows, fields] = await conn.query(sqlCountReportCnt, [vaccine_id]);//백신별 부작용 수 가져오기
        res.json({success: true, rows: rows});//결과 출력
        
      }
      catch(err){
        console.log("Error: MySQL returned ERROR :" + err);
        res.json({success: false});
      }
      finally{
          conn.release();
      }

})

module.exports = router;