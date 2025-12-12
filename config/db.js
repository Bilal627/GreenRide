const mysql = require('mysql');

const pool = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    user: 'root',
    password:'',
    database:'awpo'
});

pool.getConnection((err,connection) => {
    if(err){
        console.error("Error al conectar bbdd: ",err.message);
    } else {
       console.log("Conexion bbdd correcto");
       connection.release(); 
    }
});

module.exports = pool;