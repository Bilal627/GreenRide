const express = require('express');
const router = express.Router();
const pool = require('../config/db.js');
const { isAuth } = require('./middlewareRoutes.js');


//API: Obtener lista de usuario
router.get('/usuarios', (req,res)=>{

  const sql = 'SELECT * FROM usuarios ORDER BY id_usuario ASC';

  pool.query(sql, (err, results) => {
    if(err){
      console.error('Error API usuario:', err);
      return res.status(500).json({ error: 'Error al obtener datos' });
    }
    res.json(results);
  });
});

router.get('/reservasTODO', (req,res)=>{

  const sql = 'SELECT * FROM reservas ORDER BY id_reserva ASC';

  pool.query(sql, (err, results) => {
    if(err){
      console.error('Error API reservasTODO:', err);
      return res.status(500).json({ error: 'Error al obtener datos' });
    }
    res.json(results);
  });
});



//API: Obtener lista de concesionarios
router.get('/concesionarios', (req,res)=>{

  const sql = 'SELECT * FROM concesionarios ORDER BY id_concesionario ASC';

  pool.query(sql, (err, results) => {
    if(err){
      console.error('Error API Concesionarios:', err);
      return res.status(500).json({ error: 'Error al obtener datos' });
    }
    res.json(results);
  });
});

//API: Obtener lista de vehiculos todos
router.get('/vehiculosTODO', (req,res)=>{

  const sql = 'SELECT * FROM vehiculos ORDER BY id_vehiculo ASC';

  pool.query(sql, (err, results) => {
    if(err){
      console.error('Error API Vehiculos:', err);
      return res.status(500).json({ error: 'Error al obtener datos' });
    }
    res.json(results);
  });
});


//API: Obtener lista de vehiculos disponibles
router.get('/vehiculos', isAuth, (req, res) => {

  const rol = req.session.user.rol;
  const concesionarioId = req.session.user.id_concesionario;
  let sql = "";
  let params = [];

  if(rol === 'admin'){
    sql = "SELECT id_vehiculo, marca, modelo, matricula FROM vehiculos";
    params = [];
  }
  else{
    sql = "SELECT id_vehiculo, marca, modelo, matricula FROM vehiculos WHERE id_concesionario = ?";
    params = [concesionarioId];
 }

  pool.query(sql, [req.session.user.id_concesionario], (err, results) => {
      if(err){
          console.error('Error API Vehiculos:', err);
          return res.status(500).json({ error: 'Error al obtener datos' });
      }
      res.json(results);
  });
});


module.exports = router;