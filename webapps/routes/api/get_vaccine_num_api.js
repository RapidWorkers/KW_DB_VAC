var express = require('express');
var router = express.Router();

const getSqlConnectionAsync = require('../../configs/mysql_load').getSqlConnectionAsync;

router.get('/', async function(req, res, next){

    if(req.session.loggedin === undefined || req.session.loggedin ===0)//로그인 안 된 경우
    {
        return res.json({success: false});//에러
    }
  
    var sqlGetLeftVacc = "SELECT V.vac_name, D.max_num, V.id FROM VACC_DIST AS D, VACCINE AS V WHERE D.vaccine_type = V.id and D.hospital_id = ? and D.vaccine_date = ?";
    var sqlGetReservationNum = "SELECT vaccine_type, count(*) as count FROM RESERVATION WHERE  hospital_id = ? and reserve_date = ? GROUP BY vaccine_type";
    
    try{
        var hospital_id = req.query.hospital_id;
        var reserve_date = req.query.reserve_date;//변수 가져옴

        var conn = await getSqlConnectionAsync();
        var [rows, fields] = await conn.query(sqlGetLeftVacc, [hospital_id, reserve_date]);//백신 조회
        var [reserve_nums, fields] = await conn.query(sqlGetReservationNum, [hospital_id, reserve_date]);//예약개수 조회

  
        //병원에 분배된 최대 백신 수에서 이미 예약된 백신 수를 빼, 잔여 백신 수를 구함
        for(var i=0;i<reserve_nums.length;i++){
          var index = rows.findIndex(function(curArray){//인덱스 찾기
            return curArray.id === reserve_nums[i].vaccine_type;
          });

          if(index !== -1)//없는게 아니라면
            rows[index].max_num -= reserve_nums[i].count;//빼기
        }


        //백신 수량이 0개인 것은 제거
        var i = 0;
        while(i<rows.length && i >= 0)//개수만큼 반복
        {
          if(rows[i].max_num <= 0){//0개거나 음수면
            rows.splice(i,1);//제거
            i -= 1;
          }
          i +=1;//다음걸로
        }
  
        res.json({success: true, rows: rows});//사용자에게 결과 출력
        
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