const express = require('express');
const router = express.Router();
const pool = require('../config/db.js');
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcrypt');


//Ruta para la pagina de inicio
router.get('/', (req, res) => {
    res.render('index', {
      titulo: 'GreenRide - Inicio',
      pagina: 'inicio',
    });
});

//ruta pagina de vehiculos
router.get('/vehiculos', (req, res) => {

  let sql = 'SELECT V.*, C.nombre as nombre_concesionario FROM vehiculos V JOIN concesionarios C ON V.id_concesionario = C.id_concesionario';
  let values = [];

  if(req.session.user && req.session.user.rol === 'empleado'){
    sql += ' WHERE V.id_concesionario = ?';
    values.push(req.session.user.id_concesionario);
  }

  pool.query(sql, values, (err, vehiculos) => {
    if(err){
      console.error("Error al cargar vehiculos:", err);
      return res.status(500).send("Error al cargar la lista de vehiculos");
    }

    res.render('vehiculos', {
      titulo: 'GreenRide - Vehiculos',
      pagina: 'vehiculos',
      vehiculos: vehiculos
    });
  });
});



module.exports = router;

