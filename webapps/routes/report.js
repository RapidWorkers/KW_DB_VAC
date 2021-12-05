var express = require('express');
var router = express.Router();
const getSqlConnectionAsync = require('../configs/mysql_load').getSqlConnectionAsync;

/* GET home page. */
router.get('/', function(req, res, next) {
if(req.session.loggedin === undefined || req.session.loggedin ===0)
  res.send("<script>alert('로그인이 필요합니다.');location.href='login';</script>");
else
  res.render('report', { title: '이상반응 신고' , loggedin: 1, legal_name: req.session.legal_name});
  
});

/* POST home page. */
router.post('/', async function(req, res, next) {
  
  var sqlGetReserveId = "SELECT id FROM RESERVATION WHERE uid=? ORDER BY current_series DESC;";
  var sqlInsertReport = "INSERT INTO VACC_REPORT(reserve_id, report_type, report_time) VALUES(?, ?, ?);";
  
  if(req.session.loggedin === undefined || req.session.loggedin ===0)
    res.send("<script>alert('로그인이 필요합니다.');location.href='login';</script>");
  else{
    req.body = JSON.parse(JSON.stringify(req.body));
    const {report} = req.body;

    var today = new Date();
    var todayDate = today.getFullYear() + "-" + (today.getMonth()+1) + "-" + today.getDate()+" "+today.getHours()+":"+today.getMinutes()+":"+today.getSeconds();
    
    
    try{
      var conn = await getSqlConnectionAsync();
      [row, fields] = await conn.query(sqlGetReserveId, [req.session.uid]);

      var len = Object.keys(report).length;
      for(var i=0;i<len;i++){
        [rows, fields] = await conn.query(sqlInsertReport, [row[0].id, report[i], todayDate]);
      }
           
      conn.release();
      res.render('report_result', { title: '이상반응 신고완료' , loggedin: 1, legal_name: req.session.legal_name});      
    }catch(err){
      console.log("Error: MySQL returned ERROR : " + err);
      conn.release();
    }
    
  }
  
});

module.exports = router;