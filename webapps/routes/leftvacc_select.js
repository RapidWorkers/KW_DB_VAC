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
    //이 거지같은 예약된 백신 수는 빼둬야 함........


    try{
      var conn = await getSqlConnectionAsync();
      var [rows, fields] = await conn.query(sqlGetLeftVacc, [hospital, todayDate]);
      var [names, fields] = await conn.query(sqlGetHospitalName, [hospital]);

      console.log("H " + hospital);
      console.log(names);
      console.log("R " + rows);
      
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

    /*
    getSqlConnection((conn) => {

      var sqlGetLeftVacc = "SELECT V.vac_name, D.max_num FROM VACC_DIST AS D, VACCINE AS V WHERE D.vaccine_type=V.id and D.hospital_id =? and D.vaccine_date = ?";

      conn.query(sqlGetLeftVacc, [hospital, todayDate], function(err,rows){
        if(err) console.log("Error: MySQL returned ERROR: " + err);
        else {
          var renderInfo = { 
            title: '잔여백신 예약', 
            loggedin: 1, 
            legal_name: req.session.legal_name,
            hospital: hospital,
            todayDate: todayDate,
            rows: rows
          }

          console.log(rows);
          
          res.render('left_vacc', renderInfo);
        }
      })
    }) 
    */

  }
});


/* POST home page. */
router.post('/', function(req, res, next) {
  if(req.session.loggedin === undefined || req.session.loggedin ===0)
  {
    res.send("<script>alert('로그인이 필요합니다.');location.href='/login';</script>");
  }
  else
  {
    res.render('left_vacc_result', { title: '잔여백신 예약', loggedin: 1, legal_name: req.session.legal_name});
  }
  
});

module.exports = router;

