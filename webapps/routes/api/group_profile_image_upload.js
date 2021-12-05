var express = require('express');
var router = express.Router();

const util = require("util");
const fs = require("fs");
const unlink = util.promisify(fs.unlink);

var multer = require('multer');
const upload = multer({ dest: 'public/grp_profile', limits: {fileSize: 10*1024*1024} });
const getSqlConnectionAsync = require('../../configs/mysql_load').getSqlConnectionAsync;

router.post('/:gid', upload.single('profile_image'), async function(req, res){
    var sqlGetOldProfile = "SELECT profile_img FROM TEAM WHERE id = ? and owner_uid = ?;";
    var sqlUpdateProfileImage = "UPDATE TEAM SET profile_img = ? WHERE id = ? and owner_uid = ?;";

    if(req.file === undefined) return res.json({success: false});//upload fail
    if(!req.session.uid) {//no logged in user
        await unlink(req.file.path)//delete uploaded file
        return res.json({success: false});
    }

    var profileImg = req.file.filename;

    try{
        var conn = await getSqlConnectionAsync();

        var [rows, fields] = await conn.query(sqlGetOldProfile, [req.params.gid, req.session.uid]);

        if(rows.length){
            if(rows[0].profile_img)
            {
                var oldPath = "public/grp_profile/"+rows[0].profile_img;
                fs.access(oldPath, fs.F_OK, async (err) => {
                    if (!err) await unlink("public/grp_profile/"+rows[0].profile_img);//remove old profile
                })
            }

            [rows, fields] = await conn.query(sqlUpdateProfileImage, [profileImg, req.params.gid, req.session.uid]);

            res.json({success: true, path: profileImg});
        }
        else //no match group
        {
            await unlink(req.file.path)//delete uploaded file
            res.json({success: false});
        }

        conn.release();
    }
    catch(err){
        await unlink(req.file.path)//delete uploaded file
        res.json({success: false});
        console.log("API ERROR:" + err);
        conn.release();
    }
    
});

router.delete('/:gid', async function(req, res){
    var sqlGetOldProfile = "SELECT profile_img FROM TEAM WHERE id = ? and owner_uid = ?;";
    var sqlUpdateProfileImage = "UPDATE TEAM SET profile_img = NULL WHERE id = ? and owner_uid = ?;";

    if(!req.session.uid) {//no logged in user
        return res.json({success: false});
    }

    try{
        var conn = await getSqlConnectionAsync();

        var [rows, fields] = await conn.query(sqlGetOldProfile, [req.params.gid, req.session.uid]);
        if(rows[0].profileImg === null)
        {
            conn.release();
            return res.json({success: true});
        }
        
        if(rows[0].profile_img)
        {
            var oldPath = "public/grp_profile/"+rows[0].profile_img;
            fs.access(oldPath, fs.F_OK, async (err) => {
                if (!err) await unlink("public/grp_profile/"+rows[0].profile_img);//remove old profile
            })
        }

        [rows, fields] = await conn.query(sqlUpdateProfileImage, [req.params.gid, req.session.uid]);

        res.json({success: true});
        conn.release();
    }
    catch(err){
        res.json({success: false});
        console.log("API ERROR:" + err);
        conn.release();
    }
})

module.exports = router;