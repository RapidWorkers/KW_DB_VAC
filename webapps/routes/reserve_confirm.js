var express = require('express');
var router = express.Router();
const getSqlConnectionAsync = require('../configs/mysql_load').getSqlConnectionAsync;

/* POST reserve confirm(백신 예약완료 페이지) */

//~~~/reserve_confirm/reserve_confirm
//잔여백신 예약 완료 페이지와 동일한 화면이여서 재사용
router.post('/', async function(req, res, next) {
  if(req.session.loggedin === undefined || req.session.loggedin ===0)
  {
    res.send("<script>alert('로그인이 필요합니다.');location.href='/login';</script>");
  }
  else
  {
    var vaccine_id = req.body.vaccine_id;
    var vaccine_name = req.body.vaccine_name;
    var hospital_id = req.body.hospital_id;
    var hospital_name = req.body.hospital_name;
    var reserve_date = req.body.reserve_date;
    var uid = req.session.uid;
    var reserveChange = req.body.reserveChange;

    if(!vaccine_id || !vaccine_name || !hospital_id || !hospital_name || !reserve_date)
    {
      res.send("<script>alert('잘못된 경로로 접근했습니다!');location.href='/';</script>");
    }

    var sqlGetUserAge = "SELECT birthdate, Vaccinated FROM USER_VACCINATED WHERE uid = ?";
    var sqlGetVaccInfo = "SELECT min_age FROM VACCINE WHERE id = ?;";
    var sqlInsertLeftVaccReserve = "INSERT INTO RESERVATION(reserve_date, uid, vaccine_type, hospital_id, current_series) VALUE(?,?,?,?,?);";
    var sqlGetReservation = "SELECT id FROM RESERVATION WHERE uid = ? and current_series = ?;";
    var sqlUpdateOldReserv = "UPDATE RESERVATION SET reserve_date = ?, vaccine_type = ?, hospital_id = ? WHERE uid = ? and current_series = ?;";

    try{
      //사용자의 생년월일과 선택한 백신의 최저 연령을 가져옴
      var conn = await getSqlConnectionAsync();

      var [userInfo, fields] = await conn.query(sqlGetUserAge, [uid]);
      var [vaccineInfo, fields] = await conn.query(sqlGetVaccInfo,[vaccine_id]);

      //백신 접종 차수 구하기
      var series = 0;
      if(userInfo[0].Vaccinated ==="NO")
        series = 1;
      else if(userInfo[0].Vaccinated === "PARTIAL")
        series = 2;
      else
        series = 3;


      var [reserveInfo, fields] = await conn.query(sqlGetReservation, [uid, series]);

      //만 나이 계산
      var today = new Date();
      var birthday = new Date(userInfo[0].birthdate);
      var age = today.getFullYear() - birthday.getFullYear();
      var month = today.getMonth() - birthday.getMonth();
      

      if (month < 0 || (month === 0 && today.getDate() < birthday.getDate())) {
        age = age - 1;
      }
      

      //백신 접종 불가 사유 분류
      var reason = null;

      if(vaccineInfo[0].min_age > age)
        var reason = "접종 연령 미달";
       
      if(series === 3)
        var reason = "접종 완료";
  
     
      if(reserveInfo.length > 0 && reserveChange != 1)
        var reason = "기예약건 존재";

      console.log(reserveChange);
      if(reserveInfo.length == 0 && reserveChange == 1)
        var reason = "기존 예약이 없어 예약변경 불가능"
      
      if(reason)
      {
        res.render('reserve_fail', { title: '백신 예약 실패', loggedin: 1, legal_name: req.session.legal_name, 
        reason: reason ,vaccine_name: vaccine_name, hospital_name: hospital_name});
        conn.release();
      }
      else
      {
        
        if(reserveChange==1)  //백신 예약 변경
        {
          console.log("change");
          var reserveInfo = [reserve_date, vaccine_id, hospital_id, uid, series];
          var [rows, fields] = await conn.query(sqlUpdateOldReserv, reserveInfo);
        }
        else  //백신 예약 신규 추가
        {
          var reserveInfo = [reserve_date, uid, vaccine_id, hospital_id, series];
          var [rows, fields] = await conn.query(sqlInsertLeftVaccReserve, reserveInfo);
        }

        res.render('reserve_confirm', { title: '백신 예약 성공', loggedin: 1, legal_name: req.session.legal_name
        ,vaccine_name: vaccine_name, hospital_name: hospital_name});
      }

      conn.release();
    }
    catch(err){
      console.log("Error: MySQL returned ERROR :" + err);
      var reason = "백신 수량 부족";
      res.render('reserve_fail', { title: '백신 예약 실패', loggedin: 1, legal_name: req.session.legal_name, 
      reason: reason ,vaccine_name: vaccine_name, hospital_name: hospital_name});
      conn.release();
    }

  }
  
});

module.exports = router;