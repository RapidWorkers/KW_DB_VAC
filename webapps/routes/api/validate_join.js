var express = require('express');
var router = express.Router();
const getSqlConnectionAsync = require('../../configs/mysql_load').getSqlConnectionAsync;

router.post('/', async function (req, res, next) {

    if(req.session.loggedin === 1) return res.json({success: false});//not for logged in user
    if(!req.body.validateType) return res.json({success: false});

    console.log('test');
    
    var sqlChkUsernameDup = "SELECT count(*) as dup from USER where username = ?;";
    var sqlChkEmailDup = "SELECT count(*) as dup from USER where email = ?;";
    var sqlChkPhoneDup = "SELECT count(*) as dup from USER where phone = ?;";

    if(req.body.validateType == 1)//username validation
    {
        var username = req.body.username;
        if(!username || !username.length) return res.json({success: false});

        try{
            var conn = await getSqlConnectionAsync();
            var [rows, fields] = await conn.query(sqlChkUsernameDup, [username]);
            
            if(rows[0].dup === 0) res.json({success: true});
            else res.json({success: false});

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
        if(!email || !email.length) return res.json({success: false});

        try{
            var conn = await getSqlConnectionAsync();
            var [rows, fields] = await conn.query(sqlChkEmailDup, [email]);
            
            if(rows[0].dup === 0) res.json({success: true});
            else res.json({success: false});

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
        if(!phone || !phone.length) return res.json({success: false});

        try{
            var conn = await getSqlConnectionAsync();
            var [rows, fields] = await conn.query(sqlChkPhoneDup, [phone]);
            
            if(rows[0].dup === 0) res.json({success: true});
            else res.json({success: false});

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