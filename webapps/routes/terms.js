var express = require('express');
var router = express.Router();

router.get('', function(req, res){
    res.send("당신의 이메일 쓰도록 하겠다! USER 정보가 과제 제출 기간 동안 데베에 저장됩니다.");
})

module.exports = router;