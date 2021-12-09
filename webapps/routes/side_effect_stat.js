var express = require('express');
var router = express.Router();

const getSqlConnectionAsync = require('../configs/mysql_load').getSqlConnectionAsync;

/* GET home page. */
router.get('/', async function(req, res, next) {

  //백신 부작용의 종류를 가져와 뷰에 넘겨준다.
  var sqlGetVaccReportType = "SELECT report_type, report_desc FROM VACC_REPORT_TYPE";
  //var sqlGetVaccineList = "SELECT id, vac_name FROM VACCINE";


  try{
    var conn = await getSqlConnectionAsync();
    var[vaccine_report_list, fields] =  await conn.query(sqlGetVaccReportType, []);
    //var[vaccine_list, fields] = await conn.query(sqlGetVaccineList,[]);


    res.render('side_effect_stat', { title: '부작용 통계 보기', loggedin: +(req.session.loggedin === 1), 
    legal_name: req.session.legal_name, 
    vaccine_report_list: vaccine_report_list});
  }
  catch(err){
    console.log("Error: MySQL returned ERROR :" + err);
    res.json({success: false});
  }
  finally{
      conn.release();
  }

  
});

module.exports = router;
