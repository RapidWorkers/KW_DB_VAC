var express = require('express');
var router = express.Router();

const getSqlConnectionAsync = require('../../configs/mysql_load').getSqlConnectionAsync;

router.get('/', async function(req, res, next){

    if(req.session.loggedin === undefined || req.session.loggedin ===0)
    {
        res.json({success: false});
    }
  
    var sqlGetLeftVacc = "SELECT V.vac_name, D.max_num, V.id FROM VACC_DIST AS D, VACCINE AS V WHERE D.vaccine_type = V.id and D.hospital_id = ? and D.vaccine_date = ?";
    var sqlGetReservationNum = "SELECT vaccine_type, count(*) as count FROM RESERVATION WHERE  hospital_id = ? and reserve_date = ? GROUP BY vaccine_type";
    
    try{
        var hospital_id = req.query.hospital_id;
        var reserve_date = req.query.reserve_date;

        var conn = await getSqlConnectionAsync();
        var [rows, fields] = await conn.query(sqlGetLeftVacc, [hospital_id, reserve_date]);
  
        var [reserve_nums, fields] = await conn.query(sqlGetReservationNum, [hospital_id, reserve_date]);

  
        //병원에 분배된 최대 백신 수에서 이미 예약된 백신 수를 빼, 잔여 백신 수를 구함
        console.log(rows);
        for(var i=0;i<reserve_nums.length;i++){
          var index = rows.findIndex(function(curArray){
            return curArray.id === reserve_nums[i].vaccine_type;
          });
          
          console.log(index);

          if(index !== -1)
          {
            rows[index].max_num -= reserve_nums[i].count;
          }
        }


        //백신 수량이 0개인 것은 제거
        var i = 0;
        while(i<rows.length && i >= 0)
        {
          if(rows[i].max_num <= 0){
            rows.splice(i,1);
            i -= 1;
          }
          i +=1;
        }
  
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