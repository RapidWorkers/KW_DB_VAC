var express = require('express');
var router = express.Router();

const getSqlConnectionAsync = require('../../configs/mysql_load').getSqlConnectionAsync;

router.get('/', async function (req, res, next) {

    var sqlSearchDistrict = 'SELECT DISTINCT SUBSTRING_INDEX(SUBSTRING_INDEX(address, " ", 2), " ", -1) as district from HOSPITAL where address like ? ORDER BY district;';
    var sqlSearchDong = 'SELECT DISTINCT SUBSTRING_INDEX(SUBSTRING_INDEX(address, " ", 3), " ", -1) as dong from HOSPITAL where address like ? ORDER BY dong;';
    var sqlSearchHospital = 'SELECT id, name, address from HOSPITAL where address like ? and emergency = 0 ORDER BY name;';
    var sqlSearchHospitalEmergency = 'SELECT id, name, address, department from HOSPITAL where address like ? and emergency = 1 ORDER BY name;';

    /*
        Input:
            searchType:
                0: 광역자치단체 검색
                1: 기초자치단체 검색
                2: 동면리 검색
            
            metropol: 광역자치단체 String
            district: 기초자치단체 String
            dong: 동면리 String
            emergency: 응급실 여부 0/1
    */

    var metropol = req.query.metropol;
    var district = req.query.district;
    var dong = req.query.dong;
    var emergency = req.query.emergency;

    if(!req.query.searchType) return res.json({success: false});//서치타입 없으면 에러

    var searchType = req.query.searchType;
    if(searchType == 0)//구군시 검색
    {
        if(!metropol) return res.json({success: false});//없으면 에러

        try {
            var conn = await getSqlConnectionAsync();
            var [rows, fields] = await conn.query(sqlSearchDistrict, [metropol+"%"]);//검색 수행
            
            var districtArray = [];

            rows.forEach(element => {//어레이 추출
                districtArray.push({name: element.district});
            });

            districtArray.success = true;
            res.json(districtArray);//결과 출력

            conn.release();
        } catch(err) {
            res.json({success: false});
            console.log("Error: MySQL returned ERROR : " + err);
            conn.release();
        }
    }
    else if(searchType == 1)
    {
        if(!metropol) return res.json({success: false});//없으면 에러
        if(!district) return res.json({success: false});//없으면 에러

        try {
            var conn = await getSqlConnectionAsync();
            var [rows, fields] = await conn.query(sqlSearchDong, [metropol+" "+district+"%"]);//검색 수행
            
            var dongArray = [];

            rows.forEach(element => {
                dongArray.push({name: element.dong});//이름만 추출해서 출력
            });

            dongArray.success = true;
            res.json(dongArray);//결과 출력
            
            conn.release();
        } catch(err) {
            res.json({success: false});
            console.log("Error: MySQL returned ERROR : " + err);
            conn.release();
        }
    }
    else if(searchType == 2)
    {
        if(!metropol) return res.json({success: false});//없으면 에러
        if(!district) return res.json({success: false});//없으면 에러

        try {
            var conn = await getSqlConnectionAsync();
            if(!emergency || emergency == 0)//응급실 아닐때
            {
            if(!dong) return res.json({success: false});//Only when non-emergency
            var [rows, fields] = await conn.query(sqlSearchHospital, [metropol+" "+district+" "+dong+"%"]);//검색
            
            var hospitalArray = [];

            rows.forEach(element => {
                hospitalArray.push({id: element.id, name: element.name, addr: element.address});//필요한 정보 추출
            });

            hospitalArray.success = true;
            res.json(hospitalArray);//사용자 출력
            }
            else
            {
                var [rows, fields] = await conn.query(sqlSearchHospitalEmergency, [metropol+" "+district+"%"]);//검색
            
                var hospitalArray = [];
    
                rows.forEach(element => {
                    hospitalArray.push({id: element.id, name: element.name, addr: element.address, department: element.department});//필요한 정보 추출
                });
    
                hospitalArray.success = true;
                res.json(hospitalArray);//사용자 출력
            }

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
