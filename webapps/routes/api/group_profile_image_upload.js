var express = require('express');
var router = express.Router();

const util = require("util");
const fs = require("fs");
const unlink = util.promisify(fs.unlink);

var multer = require('multer');
const upload = multer({ dest: 'public/grp_profile', limits: {fileSize: 10*1024*1024} });//10MiB 제한
const getSqlConnectionAsync = require('../../configs/mysql_load').getSqlConnectionAsync;

router.post('/:gid', upload.single('profile_image'), async function(req, res){
    var sqlGetOldProfile = "SELECT profile_img FROM TEAM WHERE id = ? and owner_uid = ?;";
    var sqlUpdateProfileImage = "UPDATE TEAM SET profile_img = ? WHERE id = ? and owner_uid = ?;";

    if(req.file === undefined) return res.json({success: false});//upload fail
    if(!req.session.uid) {//no logged in user
        await unlink(req.file.path)//delete uploaded file
        return res.json({success: false});//return fail
    }

    var profileImg = req.file.filename;//get file path

    try{
        var conn = await getSqlConnectionAsync();
        var [rows, fields] = await conn.query(sqlGetOldProfile, [req.params.gid, req.session.uid]);//get old profile

        if(rows.length){//if success
            if(rows[0].profile_img)//if profile exists
            {
                var oldPath = "public/grp_profile/"+rows[0].profile_img;//get old path
                fs.access(oldPath, fs.F_OK, async (err) => {//check accessible
                    if (!err) await unlink("public/grp_profile/"+rows[0].profile_img);//remove old profile
                })
            }

            [rows, fields] = await conn.query(sqlUpdateProfileImage, [profileImg, req.params.gid, req.session.uid]);//update profile image to new one
            res.json({success: true, path: profileImg});//return result
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

//delete profile page
router.delete('/:gid', async function(req, res){
    var sqlGetOldProfile = "SELECT profile_img FROM TEAM WHERE id = ? and owner_uid = ?;";
    var sqlUpdateProfileImage = "UPDATE TEAM SET profile_img = NULL WHERE id = ? and owner_uid = ?;";

    if(!req.session.uid) {//no logged in user
        return res.json({success: false});
    }

    try{
        var conn = await getSqlConnectionAsync();
        var [rows, fields] = await conn.query(sqlGetOldProfile, [req.params.gid, req.session.uid]);

        if(rows[0].profileImg === null)//has no profile image
        {
            conn.release();
            return res.json({success: true});//does not have to delete, just return true
        }
        
        if(rows[0].profile_img)//has one
        {
            var oldPath = "public/grp_profile/"+rows[0].profile_img;//get old path
            fs.access(oldPath, fs.F_OK, async (err) => {//check accessibility
                if (!err) await unlink("public/grp_profile/"+rows[0].profile_img);//remove old profile
            })
        }

        [rows, fields] = await conn.query(sqlUpdateProfileImage, [req.params.gid, req.session.uid]);//set profile to null

        res.json({success: true});//return true
        conn.release();
    }
    catch(err){
        res.json({success: false});
        console.log("API ERROR:" + err);
        conn.release();
    }
})

module.exports = router;