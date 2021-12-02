var mysql = require('mysql');
var mysql2 = require('mysql2/promise');

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
async function getSqlConnectionAsync(){
    try{
        conn = await async_pool.getConnection();
        return conn;
    }catch (err){
        console.log("Error: MySQL returned ERROR :"+err);
    }
}

module.exports = getSqlConnection;
module.exports = getSqlConnectionAsync;