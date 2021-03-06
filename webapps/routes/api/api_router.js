var express = require('express');
var router = express.Router();

var get_hospital_list_by_area = require('./get_hospital_list_by_area');
var validate_join = require('./validate_join');
var profile_image_upload = require('./profile_image_upload');
var group_api = require('./group_api');
var group_profile_image_upload = require('./group_profile_image_upload');
var get_vaccine_num_api = require('./get_vaccine_num_api');
var get_vaccine_sideeffect_api = require('./get_vaccine_sideeffect_api');

router.use('/get_hospital_list_by_area', get_hospital_list_by_area);
router.use('/validate_join', validate_join);
router.use('/profile_image_upload', profile_image_upload);
router.use('/group_api', group_api);
router.use('/group_profile_image_upload', group_profile_image_upload);
router.use('/get_vaccine_num_api', get_vaccine_num_api);
router.use('/get_vaccine_sideeffect_api', get_vaccine_sideeffect_api);

module.exports = router;
