var express = require('express');
var router = express.Router();

const getSqlConnectionAsync = require('../configs/mysql_load').getSqlConnectionAsync;
const getSqlConnection = require('../configs/mysql_load').getSqlConnection;


/* GET home page. */
router.get('/', function(req, res, next) {
  if(req.session.loggedin === undefined || req.session.loggedin ===0)
    res.send("<script>alert('로그인이 필요합니다.');location.href='login';</script>");
  else{
    getSqlConnection((conn) =>{
      var sqlGetTeamName = "SELECT id, team_name FROM TEAM WHERE owner_uid = ?;";
      conn.query(sqlGetTeamName, [req.session.uid], function (err, rows){
        if(err) console.log("Error: MySQL returned ERROR : " + err);
        else{
          var renderInfo = {
            title: '친구 추가',
            loggedin: 1,
            legal_name: req.session.legal_name,
            rows: rows
          };
          conn.release();
          res.render('group_mem_add', renderInfo);
        }
      })
    })  
}
});

/* POST home page. */
router.post('/', async function(req, res, next) {
  if(req.session.loggedin === undefined || req.session.loggedin ===0)
    res.send("<script>alert('로그인이 필요합니다.');location.href='login';</script>");
  else{

    var sqlInsertTeamMem = "INSERT INTO TEAM_MEM(gid, uid) VALUES(?, (SELECT uid FROM USER WHERE username = ?));";

    var username = req.body.username;
    var gids = req.body.group;
    console.log(gids);
    // 정보 읽어와서 정보 추가
    try{
      var conn = await getSqlConnectionAsync();
      
      
      var [gid, fields] = await conn.query(sqlInsertTeamMem, [gids, username]);
      
      
      conn.release();
      res.redirect('group_mem_add');
      

      
    }catch(err){
        console.log("Error: MySQL returned ERROR :" + err);
        conn.release();
    }
  }
});

module.exports = router;
