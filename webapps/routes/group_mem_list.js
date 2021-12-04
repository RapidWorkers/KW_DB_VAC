var express = require('express');
var router = express.Router();
const getSqlConnectionAsync = require('../configs/mysql_load').getSqlConnectionAsync;

/* GET home page. */
router.get('/:gid', async function(req, res, next) {
  if(req.session.loggedin === 1)
  {
    // TEAM_MEM에서 gid인 사람의 uid들을 전부 불러와서 USER 테이블에서 정보 얻어오기
    var sqlGetTeam = "SELECT team_name FROM TEAM WHERE id=?;";
    var sqlGetMemList = "SELECT * FROM USER WHERE uid IN (SELECT uid FROM TEAM_MEM T WHERE gid = ?);";
    try{
      var conn = await getSqlConnectionAsync();

      var [groups,fields] = await conn.query(sqlGetTeam, [req.params.gid]);
      var [rows, fields] = await conn.query(sqlGetMemList,[req.params.gid]);

      var renderInfo={
        title: '그룹 구성원 목록 보기',
        loggedin: 1,
        legal_name: req.session.legal_name,
        rows: rows,
        groups: groups
       
      }
      
      
      conn.release();

      res.render('group_mem_list', renderInfo);
    }catch(err){
      console.log("Error: MySQL returned ERROR :" + err);
      conn.release();
    }
    
  }
  else
  {
    res.send('<script>alert("로그인이 필요합니다.");location.href="login";</script>');
  }
});


module.exports = router;
