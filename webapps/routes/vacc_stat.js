var express = require('express');
var router = express.Router();
const getSqlConnectionAsync = require('../configs/mysql_load').getSqlConnectionAsync;


/* GET home page. */
router.get('/', async function(req, res, next) {
  
  
    var sqlGetVaccStat = "SELECT reserve_date, current_series, count(uid) AS count FROM RESERVATION WHERE is_complete = 1 GROUP BY reserve_date, current_series ORDER BY reserve_date;";
    var sqlGetUserNum = "SELECT count(*) as count FROM USER";

    try{
      var conn = await getSqlConnectionAsync();
      var [rows, fields] = await conn.query(sqlGetVaccStat, []);

      var vaccStat = [];

        rows.forEach(row =>{
          
          row.reserve_date = new Date(row.reserve_date);

          row.reserve_date = row.reserve_date.getFullYear() 
          + "/" + (row.reserve_date.getMonth()+1).toString().padStart(2,"0")
          + "/" + (row.reserve_date.getDate()).toString().padStart(2,"0");

          var index = vaccStat.findIndex(function(curArray){
            return curArray.reserve_date === row.reserve_date;
          });

          if(index == -1){
            vaccStat.push({reserve_date: row.reserve_date, first: 0, second: 0});
            index = vaccStat.length-1;

            if(index != 0)
            {
              vaccStat[index].first = vaccStat[index-1].first;
              vaccStat[index].second = vaccStat[index-1].second;
            }
          }
          if(row.current_series == 1)
            vaccStat[index].first += parseInt(row.count);
          else
            vaccStat[index].second += parseInt(row.count);
        })

        var [nums, fields] = await conn.query(sqlGetUserNum, []);

        var renderInfo = {
          title: '백신 접종 통계 보기' , 
          loggedin: +(req.session.loggedin === 1), 
          legal_name: req.session.legal_name,
          rows: vaccStat,
          user_num: nums[0].count
        };

        res.render('vacc_stat', renderInfo);
        conn.release();

    }
    catch(err) {
      console.log("Error: MySQL returned ERROR :" + err);
      conn.release();
    }

    /*
    getSqlConnection((conn) => {
    conn.query(sqlGetVaccStat, [], function (err, rows) {
      if (err) console.log("Error: MySQL returned ERROR : " + err);
      else {

        var vaccStat = [];

        rows.forEach(row =>{
          
          row.reserve_date = new Date(row.reserve_date);

          row.reserve_date = row.reserve_date.getFullYear() 
          + "/" + (row.reserve_date.getMonth()+1).toString().padStart(2,"0")
          + "/" + (row.reserve_date.getDate()).toString().padStart(2,"0");

          var index = vaccStat.findIndex(function(curArray){
            return curArray.reserve_date === row.reserve_date;
          });

          if(index == -1){
            vaccStat.push({reserve_date: row.reserve_date, first: 0, second: 0});
            index = vaccStat.length-1;

            if(index != 0)
            {
              vaccStat[index].first = vaccStat[index-1].first;
              vaccStat[index].second = vaccStat[index-1].second;
            }
          }
          if(row.current_series == 1)
            vaccStat[index].first += parseInt(row.count);
          else
            vaccStat[index].second += parseInt(row.count);
        })

        var renderInfo = {
          title: '백신 접종 통계 보기' , 
          loggedin: +(req.session.loggedin === 1), 
          legal_name: req.session.legal_name,
          rows: vaccStat
        };

        res.render('vacc_stat', renderInfo);
      }
    })

    */
  

  
});

module.exports = router;
