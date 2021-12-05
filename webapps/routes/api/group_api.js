var express = require('express');
var router = express.Router();

const getSqlConnectionAsync = require('../../configs/mysql_load').getSqlConnectionAsync;

router.get('/', async function(req, res){
    if(!req.session.uid) res.json({success: false});
    var sqlGetGroupInfo = "SELECT * FROM TEAM WHERE owner_uid = ?;";

    try{
        var conn = await getSqlConnectionAsync();
        var [rows, fields] = await conn.query(sqlGetGroupInfo, [req.session.uid]);

        var groupJson = {success: true, groups: []};

        rows.forEach(element => {
            groupJson.groups.push({gid: element.id, name: element.team_name, profile: (element.profile_img === null)?-1:element.profile_img});
        });

        res.json(groupJson);
    }
    catch(err){
        console.log("API ERROR: " + err);
        res.json({success: false});
    }
    finally{
        conn.release();
    }  
})

router.post('/',  async function(req, res){
    if(!req.session.uid) res.json({success: false});

    var sqlAddGrp = "INSERT INTO TEAM (team_name, owner_uid) VALUE (?, ?);";

    console.log(req.body);

    try{
        var conn = await getSqlConnectionAsync();
        var [rows, fields] = await conn.query(sqlAddGrp, [req.body.team_name, req.session.uid]);
        res.json({success: true});
    }
    catch(err){
        console.log("API ERROR: " + err);
        res.json({success: false});
    }
    finally{
        conn.release();
    }  
})

router.put('/', async function(req, res){
    
})

router.delete('/:gid', async function(req, res){
    if(!req.session.uid) res.json({success: false});

    var sqlDelGrp = "DELETE FROM TEAM WHERE id = ? and owner_uid = ?;";

    try{
        var conn = await getSqlConnectionAsync();
        var [rows, fields] = await conn.query(sqlDelGrp, [req.params.gid, req.session.uid]);

        if(rows.affectedRows !== 1) res.json({success: false});
        else res.json({success: true});
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