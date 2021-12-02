var mysql = require('mysql');
var mysql2 = require('mysql2');

var mysqlConfig = require('./mysql_config.json');

var pool = mysql.createPool(mysqlConfig);

function getSqlConnection(callback){
    pool.getConnection(function (err, conn){
        if(!err){
            callback(conn);
        }
    });
}

var async_pool = mysql2.createPool(mysqlConfig);
function getSqlConnectionAsync(callback){
    async_pool.getConnection(function (err, conn){
        if(!err){
            callback(conn);
        }
    });
}

module.exports = getSqlConnection;
module.exports = getSqlConnectionAsync;