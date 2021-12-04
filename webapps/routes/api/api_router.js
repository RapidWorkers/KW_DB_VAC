var express = require('express');
var router = express.Router();

var get_hospital_list_by_area = require('./get_hospital_list_by_area');
var validate_join = require('./validate_join');
var profile_image_upload = require('./profile_image_upload');

router.use('/get_hospital_list_by_area', get_hospital_list_by_area);
router.use('/validate_join', validate_join);
router.use('/profile_image_upload', profile_image_upload);

module.exports = router;
