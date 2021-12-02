var express = require('express');
const getSqlConnectionAsync = require('../configs/mysql_load');
var router = express.Router();
const getSqlConnection = require('../configs/mysql_load');

/* GET home page. */
router.get('/', async function(req, res, next) {
  if(req.session.loggedin === 1)//check login
  {

    var sqlGetUserInfo = "SELECT sex, birthdate, address, email, phone from USER where uid = ?;";
    var sqlGetVaccinatedSeries = "SELECT Vaccinated from USER_VACCINATED where uid = ?;";
    var sqlGetFirstDoseInfo = "SELECT V.vac_name, R.reserve_date FROM RESERVATION R INNER JOIN VACCINE V ON R.vaccine_type = V.id WHERE uid = ? and current_series = 1;";
    var sqlGetSecondDoseInfo = "SELECT V.vac_name, R.reserve_date FROM RESERVATION R INNER JOIN VACCINE V ON R.vaccine_type = V.id WHERE uid = ? and current_series = 2;";

    try {
      var conn = await getSqlConnectionAsync();
      var [rows, fields] = await conn.query(sqlGetUserInfo, [req.session.uid]);

      var bdate = new Date(rows[0].birthdate);
      var renderInfo = {
        title: '내 정보 보기',
        loggedin: 1,
        legal_name: req.session.legal_name,
        sex: (rows[0].sex === 1)?"여자":"남자",
        byear:bdate.getFullYear(),
        bmonth:(bdate.getMonth()+1).toString().padStart(2,"0"),
        bday:(bdate.getDate()).toString().padStart(2,"0"),
        phone: rows[0].phone,
        email: rows[0].email,
        address: rows[0].address
      };

      [rows, fields] = await conn.query(sqlGetVaccinatedSeries, [req.session.uid]);
      renderInfo.vaccinatedStatus = rows[0].Vaccinated;

      [rows, fields] = await conn.query(sqlGetFirstDoseInfo, [req.session.uid]);
      if(rows.length != 0)//No vaccine reservation
      {
        renderInfo.firstVaccineName = rows[0].vac_name;
        renderInfo.first_reserve_date = rows[0].reserve_date;
      }
      else
      {
        renderInfo.firstVaccineName = "-";
        renderInfo.first_reserve_date = null;
      }

      [rows, fields] = await conn.query(sqlGetSecondDoseInfo, [req.session.uid]);
      if(rows.length != 0)//No vaccine reservation
      {
        renderInfo.secondVaccineName = rows[0].vac_name;
        renderInfo.second_reserve_date = rows[0].reserve_date;
      }
      else
      {
        renderInfo.secondVaccineName = "-";
        renderInfo.second_reserve_date = null;
      }

      //Release connection
      conn.release();

      console.log(renderInfo);
      res.render('mypage', renderInfo);

    } catch(err) {
      console.log("Error: MySQL returned ERROR : " + err);
    }
  }
  else
  {
    res.send('<script>alert("로그인이 필요합니다.");location.href="login";</script>');
  }
  
});

module.exports = router;
