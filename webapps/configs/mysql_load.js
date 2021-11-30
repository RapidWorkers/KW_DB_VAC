var mysql = require('mysql');
var mysqlConfig = require('./mysql_config.json');

var pool = mysql.createPool(mysqlConfig);

function getSqlConnection(callback){
    pool.getConnection(function (err, conn){
        if(!err){
            callback(conn);
        }
    });
}

module.exports = getSqlConnection;