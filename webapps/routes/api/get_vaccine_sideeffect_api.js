var express = require('express');
var router = express.Router();

const getSqlConnectionAsync = require('../../configs/mysql_load').getSqlConnectionAsync;

router.get('/', async function(req, res, next){

    if(req.session.loggedin === undefined || req.session.loggedin ===0)
    {
        res.json({success: false});
    }
  
    var sqlCountReportCnt = "SELECT VR.report_type, COUNT(*) AS report_cnt FROM RESERVATION AS RE RIGHT OUTER JOIN VACC_REPORT AS VR ON VR.reserve_id = RE.id WHERE RE.vaccine_type=? GROUP BY VR.report_type";
    
    try{
        var vaccine_id = req.query.vaccine_id;

        var conn = await getSqlConnectionAsync();
        var [rows, fields] = await conn.query(sqlCountReportCnt, [vaccine_id]);
  
        console.log(rows);

        res.json({success: true, rows: rows});
        
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