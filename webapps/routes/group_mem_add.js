var express = require('express');
var router = express.Router();

const getSqlConnectionAsync = require('../configs/mysql_load').getSqlConnectionAsync;
const getSqlConnection = require('../configs/mysql_load').getSqlConnection;


/* GET home page. */
router.get('/', function(req, res, next) {
  // 로그인이 안 되었을 경우 예외처리
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
            rows: rows,
            selected_gid: (!req.query.gid)?-1:req.query.gid
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
    var sqlGetTeamOwner = "SELECT owner_uid FROM TEAM WHERE id = ? and owner_uid = ?;";
    var sqlInsertTeamMem = "INSERT INTO TEAM_MEM(gid, uid) VALUES(?, (SELECT uid FROM USER WHERE username = ?));";
    
    // 사용자 입력값(친구 아이디, 그룹 종류) 얻어옴
    var username = req.body.username;
    var gids = req.body.group;

    try{
      var conn = await getSqlConnectionAsync();
      
      var [rows, fields] = await conn.query(sqlGetTeamOwner, [req.body.group, req.session.uid]);
      var [gid, fields] = await conn.query(sqlInsertTeamMem, [gids, username]);

      // 사용자 외의 다른 사람이 사용자의 그룹에 접근하려 할 경우 예외처리
      if(rows.length == 0)
      {
        conn.release();
        return res.send('<script>alert("잘못된 경로로 접근하였습니다.");location.href="/group_list";</script>'); 
      }
      
      conn.release();
      res.redirect('/group_mem_list/'+gids);
      
    }catch(err){
        console.log("Error: MySQL returned ERROR :" + err);
        conn.release();
    }
  }
});

module.exports = router;
