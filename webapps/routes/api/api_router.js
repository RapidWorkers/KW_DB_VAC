var express = require('express');
var router = express.Router();

var get_hospital_list_by_area = require('./get_hospital_list_by_area');
var validate_join = require('./validate_join');

router.use('/get_hospital_list_by_area', get_hospital_list_by_area);
router.use('/validate_join', validate_join);

module.exports = router;
