var express = require('express');
var router = express.Router();

const util = require("util");
const fs = require("fs");
const unlink = util.promisify(fs.unlink);

var multer = require('multer');
const upload = multer({ dest: 'public/profile', limits: {fileSize: 10*1024*1024} });//10MiB 최대 용량
const getSqlConnectionAsync = require('../../configs/mysql_load').getSqlConnectionAsync;

//profile upload
router.post('/', upload.single('profile_image'), async function(req, res){
    var sqlGetOldProfile = "SELECT profile_img FROM USER WHERE uid = ?;";
    var sqlUpdateProfileImage = "UPDATE USER SET profile_img = ? WHERE uid = ?;";

    if(req.file === undefined) return res.json({success: false});//upload fail
    if(!req.session.uid) {//no logged in user
        await unlink(req.file.path)//delete uploaded file
        return res.json({success: false});//return false
    }

    var profileImg = req.file.filename;//get filename

    try{
        var conn = await getSqlConnectionAsync();

        var [rows, fields] = await conn.query(sqlGetOldProfile, [req.session.uid]);//get old profile
        if(rows[0].profile_img)
        {
            var oldPath = "public/profile/"+rows[0].profile_img;//get old profile path
            fs.access(oldPath, fs.F_OK, async (err) => {//file accessibility check
                if (!err) await unlink("public/profile/"+rows[0].profile_img);//remove old profile
            })
        }

        [rows, fields] = await conn.query(sqlUpdateProfileImage, [profileImg, req.session.uid]);//update profile image

        res.json({success: true, path: profileImg});//return new profile path
        conn.release();
    }
    catch(err){
        res.json({success: false});//return false
        console.log("API ERROR:" + err);
        conn.release();
    }
    
});

//profile delete page
router.delete('/', async function(req, res){
    var sqlGetOldProfile = "SELECT profile_img FROM USER WHERE uid = ?;";
    var sqlUpdateProfileImage = "UPDATE USER SET profile_img = NULL WHERE uid = ?;";

    if(!req.session.uid) {//no logged in user
        return res.json({success: false});//return false
    }

    try{
        var conn = await getSqlConnectionAsync();

        var [rows, fields] = await conn.query(sqlGetOldProfile, [req.session.uid]);//get old profile
        if(rows[0].profileImg === null)//if not exists
        {
            conn.release();
            return res.json({success: true});//just return true
        }
        
        if(rows[0].profile_img)//if exists
        {
            var oldPath = "public/profile/"+rows[0].profile_img;//get old path
            fs.access(oldPath, fs.F_OK, async (err) => {//file accessibility check
                if (!err) await unlink("public/profile/"+rows[0].profile_img);//remove old profile
            })
        }

        [rows, fields] = await conn.query(sqlUpdateProfileImage, [req.session.uid]);//update profile image

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