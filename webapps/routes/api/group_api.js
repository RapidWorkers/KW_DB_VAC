var express = require('express');
var router = express.Router();

const getSqlConnectionAsync = require('../../configs/mysql_load').getSqlConnectionAsync;

//그룹 목록 조회 페이지
router.get('/', async function(req, res){
    if(!req.session.uid) return res.json({success: false});//로그인 안 했으면 에러
    var sqlGetGroupInfo = "SELECT * FROM TEAM WHERE owner_uid = ?;";

    try{
        var conn = await getSqlConnectionAsync();
        var [rows, fields] = await conn.query(sqlGetGroupInfo, [req.session.uid]);//목록 조회

        var groupJson = {success: true, groups: []};//결과 값 변수

        rows.forEach(element => {
            groupJson.groups.push({gid: element.id, name: element.team_name, profile: (element.profile_img === null)?-1:element.profile_img});//정보 추출 후 변수에 담음
        });

        res.json(groupJson);//결과 출력
    }
    catch(err){
        console.log("API ERROR: " + err);
        res.json({success: false});
    }
    finally{
        conn.release();
    }  
})

//그룹 생성 페이지
router.post('/',  async function(req, res){
    if(!req.session.uid) return res.json({success: false});//로그인 안 했으면 에러

    var sqlAddGrp = "INSERT INTO TEAM (team_name, owner_uid) VALUE (?, ?);";

    try{
        var conn = await getSqlConnectionAsync();
        var [rows, fields] = await conn.query(sqlAddGrp, [req.body.team_name, req.session.uid]);//그룹 추가 쿼리 수행
        res.json({success: true});//결과 반환
    }
    catch(err){
        console.log("API ERROR: " + err);
        res.json({success: false});
    }
    finally{
        conn.release();
    }  
})

//그룹의 친구 목록 조회
router.get('/:gid', async function(req, res){
    if(!req.session.uid) return res.json({success: false});//로그인 안 했으면 에러

    var sqlChkGroupOwn = "SELECT * FROM TEAM WHERE id = ? and owner_uid = ?;";
    var sqlGetMemList = "SELECT uid, legal_name FROM USER WHERE uid IN (SELECT uid FROM TEAM_MEM T WHERE gid = ?);";
    var sqlGetMemFull = "SELECT uid, legal_name FROM USER WHERE uid IN (SELECT DISTINCT uid FROM TEAM_MEM T WHERE gid IN (SELECT id FROM TEAM WHERE owner_uid = ?));"

    try{
        var conn = await getSqlConnectionAsync();

        if(req.params.gid == 0)//그룹 아이디가 0번이면
        {
            var [rows, fields] = await conn.query(sqlGetMemFull, [req.session.uid])//전체 그룹원에 대해서 조회
            var groupJson = {success: true, uids: rows};//결과 출력
            res.json(groupJson);//사용자에게 보내주기
        }
        else//그게 아니면
        {
            var [rows, fields] = await conn.query(sqlChkGroupOwn, [req.params.gid, req.session.uid]);//특정 그룹 먼저 소유권 확인 및 조회
            if(rows.length == 0)
            {
                res.json({success: false});//소유를 안 했으면 에러
            }
            else//소유했으면
            {
                [rows, fields] = await conn.query(sqlGetMemList, [req.params.gid]);//그룹의 친구 목록 조회
                var groupJson = {success: true, uids: rows};//결과 담기
                res.json(groupJson);//출력
            }
        }

    }
    catch(err){
        console.log("API ERROR: " + err);
        res.json({success: false});
    }
    finally{
        conn.release();
    }  
})

//그룹에서 친구 삭제
router.delete('/:gid/:uid', async function(req, res){
    if(!req.session.uid) return res.json({success: false});//로그인 안했으면 에러

    var sqlChkGroupOwn = "SELECT * FROM TEAM WHERE id = ? and owner_uid = ?;";
    var sqlDelTeamMem = "DELETE FROM TEAM_MEM WHERE gid = ? and uid = ?;";

    try{
        var conn = await getSqlConnectionAsync();

        var [rows, fields] = await conn.query(sqlChkGroupOwn, [req.params.gid, req.session.uid]);//그룹 소유권 조회
        if(rows.length == 0)//소유 안했으면
        {
            res.json({success: false});//에러
        }
        else//소유 했으면
        {
            [rows, fields] = await conn.query(sqlDelTeamMem, [req.params.gid, req.params.uid]);//그룹 친구 삭제
            if(rows.affectedRows !== 1) res.json({success: false});//실패했으면 실패
            else res.json({success: true});//성공했으면 성공
        }

    }
    catch(err){
        console.log("API ERROR: " + err);
        res.json({success: false});
    }
    finally{
        conn.release();
    }  
})

//그룹 삭제 페이지
router.delete('/:gid', async function(req, res){
    if(!req.session.uid) return res.json({success: false});//로그인 안 했으면 에러

    var sqlDelGrp = "DELETE FROM TEAM WHERE id = ? and owner_uid = ?;";

    try{
        var conn = await getSqlConnectionAsync();
        var [rows, fields] = await conn.query(sqlDelGrp, [req.params.gid, req.session.uid]);//그룹 삭제

        if(rows.affectedRows !== 1) res.json({success: false});//그룹 삭제 실패했으면 오류
        else res.json({success: true});//성공했으면 성공
    }
    catch(err){
        console.log("API ERROR: " + err);
        res.json({success: false});
    }
    finally{
        conn.release();
    }  
})

module.exports = router;