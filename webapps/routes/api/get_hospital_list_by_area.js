var express = require('express');
var router = express.Router();

router.get('/', async function (req, res, next) {

    var metropolitanList = [];

    var sqlSearchDistrict = 'SELECT DISTINCT SUBSTRING_INDEX(SUBSTRING_INDEX(address, " ", 2), " ", -1) from HOSPITAL where address like "?%";';
    var sqlSearchDong = 'SELECT DISTINCT SUBSTRING_INDEX(SUBSTRING_INDEX(address, " ", 3), " ", -1) from HOSPITAL where address like "? ?%";';


    var searchParameters = {};
});

module.exports = router;
