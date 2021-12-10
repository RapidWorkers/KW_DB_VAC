var express = require('express');
var router = express.Router();
const getSqlConnectionAsync = require('../../configs/mysql_load').getSqlConnectionAsync;

/*
    Input:
    validateType:
        1: 아이디 검증
        2: 이메일 검증
        3: 전화번호 검증

    username: 유저 아이디
    email: 이메일
    phone: 전화번호
*/

router.post('/', async function (req, res, next) {

    //if(req.session.loggedin === 1) return res.json({success: false});//not for logged in user
    if(!req.body.validateType) return res.json({success: false});//if element missing, return false
    
    var sqlChkUsernameDup = "SELECT count(*) as dup from USER where username = ?;";
    var sqlChkEmailDup = "SELECT count(*) as dup from USER where email = ?;";
    var sqlChkPhoneDup = "SELECT count(*) as dup from USER where phone = ?;";

    if(req.body.validateType == 1)//username validation
    {
        var username = req.body.username;//get username
        if(!username || !username.length) return res.json({success: false});//missing then error

        try{
            var conn = await getSqlConnectionAsync();
            var [rows, fields] = await conn.query(sqlChkUsernameDup, [username]);//get username duplication
            
            if(rows[0].dup === 0) res.json({success: true});//if not duplicate, return true
            else res.json({success: false});//if duplicate, return false

            conn.release();
        }
        catch(err){
            console.log("Error: MySQL returned ERROR: " + err);
            conn.release();
        }
    }
    else if(req.body.validateType == 2)//email validation
    {
        var email = req.body.email;
        if(!email || !email.length) return res.json({success: false});//missing then error

        try{
            var conn = await getSqlConnectionAsync();
            var [rows, fields] = await conn.query(sqlChkEmailDup, [email]);//get email duplication
            
            if(rows[0].dup === 0) res.json({success: true});//if not duplicate, return true
            else res.json({success: false});//if duplicate, return false

            conn.release();
        }
        catch(err){
            console.log("Error: MySQL returned ERROR: " + err);
            conn.release();
        }
    }
    else if(req.body.validateType == 3)//phone validation
    {
        var phone = req.body.phone;
        if(!phone || !phone.length) return res.json({success: false});//missing then error

        try{
            var conn = await getSqlConnectionAsync();
            var [rows, fields] = await conn.query(sqlChkPhoneDup, [phone]);//get phone duplication
            
            if(rows[0].dup === 0) res.json({success: true});//if not duplicate, return true
            else res.json({success: false});//if duplicate, return false

            conn.release();
        }
        catch(err){
            console.log("Error: MySQL returned ERROR: " + err);
            conn.release();
        }
    }
    else return res.json({success: false});//invalid type
});

module.exports = router;