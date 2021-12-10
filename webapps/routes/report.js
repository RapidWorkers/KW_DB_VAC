var express = require('express');
var router = express.Router();
const getSqlConnectionAsync = require('../configs/mysql_load').getSqlConnectionAsync;

/* GET home page. */
router.get('/', function(req, res, next) {
if(req.session.loggedin === undefined || req.session.loggedin ===0) //로그인 예외처리
  res.send("<script>alert('로그인이 필요합니다.');location.href='login';</script>");
else
  res.render('report', { title: '이상반응 신고' , loggedin: 1, legal_name: req.session.legal_name});
});

/* POST home page. */
router.post('/', async function(req, res, next) {
  
  var sqlGetReserveId = "SELECT id FROM RESERVATION WHERE uid=? ORDER BY current_series DESC;";
  var sqlInsertReport = "INSERT INTO VACC_REPORT(reserve_id, report_type, report_time) VALUES(?, ?, ?);";
  
  if(req.session.loggedin === undefined || req.session.loggedin ===0) //로그인 예외처리
    res.send("<script>alert('로그인이 필요합니다.');location.href='login';</script>");
  else{
    
    const {report} = req.body;

    //오늘 날짜 구하기
    var today = new Date();
    var todayDate = today.getFullYear() + "-" + (today.getMonth()+1) + "-" + today.getDate()+" "+today.getHours()+":"+today.getMinutes()+":"+today.getSeconds();
    
    
    try{
      //사용자의 reservation ID를 데이터베이스에거 가져옴
      var conn = await getSqlConnectionAsync();
      [row, fields] = await conn.query(sqlGetReserveId, [req.session.uid]);

      //선택된 부작용 증상이 없을 경우
      if(!report)
      {
        res.send("<script>alert('선택된 부작용이 없거나 잘못되었습니다');location.href='/report';</script>");
      }

      //각 부작용 증상을 데이터베이스에 추가
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