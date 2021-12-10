var express = require('express');
var router = express.Router();
const getSqlConnectionAsync = require('../configs/mysql_load').getSqlConnectionAsync;

/* GET home page. */
router.get('/:gid', async function(req, res, next) {
  if(req.session.loggedin === 1)
  {
    // TEAM_MEM에서 gid인 사람의 uid들을 전부 불러와서 USER 테이블에서 정보 얻어오기
    var sqlGetTeam = "SELECT * FROM TEAM WHERE id=? and owner_uid = ?;";
    
    try{
      var conn = await getSqlConnectionAsync();

      if(req.params.gid == 0)//전체 그룹원 보여주기
      {
        var renderInfo={
          title: '전체 그룹 구성원 목록 보기',
          loggedin: 1,
          legal_name: req.session.legal_name,
          fullList: req.params.gid
        }
      }
      else  
      {
        var [groups,fields] = await conn.query(sqlGetTeam, [req.params.gid, req.session.uid]);
        // 사용자가 자신의 소유가 아닌 그룹에 접근하려 할 때 예외처리
        if(groups.length == 0)
        {
          conn.release();
          return res.send('<script>alert("잘못된 경로로 접근하였습니다.");location.href="/group_list";</script>'); 
        }

        var renderInfo={
          title: '그룹 구성원 목록 보기',
          loggedin: 1,
          legal_name: req.session.legal_name,
          groups: groups,
          fullList: req.params.gid
        }
      }
      conn.release();
      res.render('group_mem_list', renderInfo);//렌더링

    }catch(err){
      console.log("Error: MySQL returned ERROR :" + err);
      conn.release();
    }
    
  }
  else  //로그인 예외처리
  {
    res.send('<script>alert("로그인이 필요합니다.");location.href="login";</script>');
  }
});


module.exports = router;
