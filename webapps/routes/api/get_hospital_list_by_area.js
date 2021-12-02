var express = require('express');
var router = express.Router();

const getSqlConnectionAsync = require('../../configs/mysql_load').getSqlConnectionAsync;

router.get('/', async function (req, res, next) {

    var sqlSearchDistrict = 'SELECT DISTINCT SUBSTRING_INDEX(SUBSTRING_INDEX(address, " ", 2), " ", -1) as district from HOSPITAL where address like ? ORDER BY district;';
    var sqlSearchDong = 'SELECT DISTINCT SUBSTRING_INDEX(SUBSTRING_INDEX(address, " ", 3), " ", -1) as dong from HOSPITAL where address like ? ORDER BY dong;';
    var sqlSearchHospital = 'SELECT id, name from HOSPITAL where address like ? ORDER BY name;';

    /*
        Input:
            searchType:
                0: 광역자치단체 검색
                1: 기초자치단체 검색
                2: 동면리 검색
            
            metropol: 광역자치단체 String
            district: 기초자치단체 String
            dong: 동면리 String

            emergency: 응급실 여부
    */

    var metropol = req.query.metropol;
    var district = req.query.district;
    var dong = req.query.dong;

    console.log(decodeURI(metropol));

    if(!req.query.searchType) return res.json({success: false});

    var searchType = req.query.searchType;
    if(searchType == 0)
    {
        if(!metropol) return res.json({success: false});

        try {
            var conn = await getSqlConnectionAsync();
            var [rows, fields] = await conn.query(sqlSearchDistrict, [metropol+"%"]);
            
            var districtArray = [];

            rows.forEach(element => {
                districtArray.push(element.district);
            });

            var resultJson = JSON.stringify(Object.assign({}, districtArray));
            resultJson.success = true;
            res.json(resultJson);

            conn.release();
        } catch(err) {
            res.json({success: false});
            console.log("Error: MySQL returned ERROR : " + err);
            conn.release();
        }
    }
    else if(searchType == 1)
    {
        if(!metropol) return res.json({success: false});
        if(!district) return res.json({success: false});

        try {
            var conn = await getSqlConnectionAsync();
            console.log(metropol+" "+district+"%");
            var [rows, fields] = await conn.query(sqlSearchDong, [metropol+" "+district+"%"]);
            
            var dongArray = [];

            rows.forEach(element => {
                dongArray.push(element.dong);
            });

            var resultJson = JSON.stringify(Object.assign({}, dongArray));
            resultJson.success = true;
            res.json(resultJson);
            
            conn.release();
        } catch(err) {
            res.json({success: false});
            console.log("Error: MySQL returned ERROR : " + err);
            conn.release();
        }
    }
    else if(searchType == 2)
    {
        if(!metropol) return res.json({success: false});
        if(!district) return res.json({success: false});
        if(!dong) return res.json({success: false});

        try {
            var conn = await getSqlConnectionAsync();
            console.log(metropol+" "+district+"%");
            var [rows, fields] = await conn.query(sqlSearchHospital, [metropol+" "+district+" "+dong+"%"]);
            
            var hospitalArray = [];

            rows.forEach(element => {
                hospitalArray.push([element.id, element.name]);
            });

            var resultJson = JSON.stringify(Object.assign({}, hospitalArray));
            resultJson.success = true;
            res.json(resultJson);

            conn.release();
        } catch(err) {
            res.json({success: false});
            console.log("Error: MySQL returned ERROR : " + err);
            conn.release();
        }
    }
    else
    {
        res.json({success: false});
    }

});

module.exports = router;
