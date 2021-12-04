var express = require('express');
var router = express.Router();
const getSqlConnectionAsync = require('../configs/mysql_load').getSqlConnectionAsync;

/* GET home page. */
router.get('/', async function(req, res, next) {
  
  if(req.session.loggedin === undefined || req.session.loggedin ===0)
  {
    res.send("<script>alert('로그인이 필요합니다.');location.href='/login';</script>");
  }
  else
  {
    var hospital = req.query.hospital_id;
    var today = new Date();
    var todayDate = today.getFullYear() + "-" + (today.getMonth()+1) + "-" + today.getDate();


    var sqlGetLeftVacc = "SELECT V.vac_name, D.max_num, V.id FROM VACC_DIST AS D, VACCINE AS V WHERE D.vaccine_type=V.id and D.hospital_id =? and D.vaccine_date = ?";
    var sqlGetHospitalName = "SELECT name FROM HOSPITAL WHERE id=?";
    var sqlGetReservationNum = "SELECT vaccine_type, count(*) as count FROM RESERVATION WHERE  hospital_id=? and reserve_date=? GROUP BY vaccine_type";


    try{
      var conn = await getSqlConnectionAsync();
      var [rows, fields] = await conn.query(sqlGetLeftVacc, [hospital, todayDate]);
      var [names, fields] = await conn.query(sqlGetHospitalName, [hospital]);
      var [reserve_nums, fields] = await conn.query(sqlGetReservationNum, [hospital, todayDate]);

      
      for(var i=0;i<reserve_nums.length;i++){
        var index = rows.findIndex(function(curArray){
          return curArray.id === reserve_nums[i].vaccine_type;
        });
        
        if(index !== undefined)
        {
          rows[index].max_num -= reserve_nums[i].count;
        }
      }


      var renderInfo = { 
        title: '잔여백신 예약', 
        loggedin: 1, 
        legal_name: req.session.legal_name,
        hospital: hospital,
        hospital_name: names[0].name,
        todayDate: todayDate,
        rows: rows
      }

      
      
      res.render('left_vacc', renderInfo);
      
      conn.release();
    }
    catch(err){
      console.log("Error: MySQL returned ERROR :" + err);
      conn.release();
    }


  }
});


/* POST home page. */
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
    var uid = req.session.uid;

    //이미 예약이 있어도 예약에 실패하도록 수정, series와 uid가 동일할 경우 실패

    var sqlGetUserAge = "SELECT birthdate, Vaccinated FROM USER_VACCINATED WHERE uid = ?";
    var sqlGetVaccInfo = "SELECT min_age FROM VACCINE WHERE id = ?";
    var sqlInsertLeftVaccReserve = "INSERT INTO RESERVATION(reserve_date, uid, vaccine_type, hospital_id, current_series) VALUE(?,?,?,?,?)";
    
    try{
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

        console.log(series);


      //만 나이 계산
      var today = new Date();
      var birthday = new Date(userInfo[0].birthdate);
      var age = today.getFullYear() - birthday.getFullYear();
      var month = today.getMonth() - birthday.getMonth();
      var todayDate = today.getFullYear() + "-" + (today.getMonth()+1) + "-" + today.getDate();

      if (month < 0 || (month === 0 && today.getDate() < birthday.getDate())) {
        age = age - 1;
      }
      
      if(vaccineInfo[0].min_age > age)
      {
        var reason = "접종 연령 미달";
        res.render('reserve_fail', { title: '잔여백신 예약 실패', loggedin: 1, legal_name: req.session.legal_name, 
        reason: reason ,vaccine_name: vaccine_name, hospital_name: hospital_name});
        
      }
      else if(series === 3)
      {
        var reason = "접종 완료";
        res.render('reserve_fail', { title: '잔여백신 예약 실패', loggedin: 1, legal_name: req.session.legal_name, 
        reason: reason ,vaccine_name: vaccine_name, hospital_name: hospital_name});
      }
      else
      {
        var reserveInfo = [todayDate, uid, vaccine_id, hospital_id, series];

        var [rows, fields] = await conn.query(sqlInsertLeftVaccReserve, reserveInfo);

        res.render('reserve_confirm', { title: '잔여백신 예약 성공', loggedin: 1, legal_name: req.session.legal_name
        ,vaccine_name: vaccine_name, hospital_name: hospital_name});
      }
      conn.release();
    }
    catch(err){
      console.log("Error: MySQL returned ERROR :" + err);
      var reason = "백신 수량 부족";
      res.render('reserve_fail', { title: '잔여백신 예약 실패', loggedin: 1, legal_name: req.session.legal_name, 
      reason: reason ,vaccine_name: vaccine_name, hospital_name: hospital_name});
      conn.release();
    }


  }
  
});

module.exports = router;

