const express = require('express');
const router = express.Router();
const pool = require('../config/db.js');
const { isAuth } = require('./middlewareRoutes.js');

//Ruta para la pagina de reserva
router.get('/reserva', isAuth, (req, res) => { 
    res.render('reserva', {
        titulo: 'GreenRide - Reserva',
        pagina: 'reserva'
  });
});

//Recibe los datos del formulario de reserva para crearla
router.post('/reserva', isAuth, (req, res) => {
  const {id_vehiculo, fecha_inicio, fecha_fin } = req.body;
  const id_usuario = req.session.user.id;

  //1. Validar que las fechas no esten en el pasado
  if(new Date(fecha_inicio) < new Date() || new Date(fecha_fin) < new Date(fecha_inicio)) {
    return res.status(400).send('Fechas de reserva invalidas.');
  }

  const sqlVehiculo = "SELECT estado FROM vehiculos WHERE id_vehiculo= ?";

  pool.query(sqlVehiculo, [id_vehiculo], (err, resultadoVehiculo) => {
    if(err){
      console.error("Error al comprobar estado del vehiculo", err);
      return res.status(500).send("Error en el servidor");
    }

    if(resultadoVehiculo.length === 0 || resultadoVehiculo[0].estado !== "disponible"){
      return res.status(400).send("El vehiculo no esta disponible.");
    }
 

  //2. Comprobar disponibilidad
   const sql = `
      SELECT * FROM reservas
      WHERE id_vehiculo = ? AND estado = 'activa'
      AND (
            (fecha_inicio <= ? AND fecha_fin >= ?) OR
            (fecha_inicio <= ? AND fecha_fin >= ?) OR
            (fecha_inicio >= ? AND fecha_fin <= ?)
      ) `;

  const values = [
      id_vehiculo, 
      fecha_fin, fecha_inicio, 
      fecha_inicio, fecha_fin, 
      fecha_inicio, fecha_fin
  ];

  pool.query(sql, values, (err, reservasSolapadas) => {
    if (err) {
      console.error("Error al comprobar solapamiento:", err);
      return res.status(500).send("Error en el servidor");
    }

    if (reservasSolapadas.length > 0) {
      return res.status(400).send("El vehículo ya está reservado en esas fechas.");
    }
    
    //3. Si esta disponible, insertar la reserva
    const insertSql = `
    INSERT INTO reservas (id_usuario, id_vehiculo, fecha_inicio, fecha_fin, estado)
    VALUES (?, ?, ?, ?, 'activa')`;

    const values = [id_usuario, id_vehiculo, fecha_inicio, fecha_fin];

    pool.query(insertSql, values, (err, result) => {
      if(err){
        console.error("Error al crear la reserva:", err);
        return res.status(500).send("Error al guardar la reserva");
      }

      //Actualizar estado del vehiculo a reservado
      const updateSql = "UPDATE vehiculos SET estado = 'reservado' WHERE id_vehiculo = ?";
      pool.query(updateSql, [id_vehiculo], (updateErr) => {
        if(updateErr){
          console.error("Error al actualizar estado del vehiculo:", updateErr);
        }

        console.log("Reserva creada con ID:", result.insertId);
        res.json({ ok: true }); 
      });
    });
  });
   });
});

//Ruta para la pagina de perfil
router.get('/perfil', isAuth, (req, res) => {

  //reservas del usuario
  const sql = "SELECT R.*, V.marca, V.modelo, V.matricula FROM reservas R JOIN vehiculos V ON R.id_vehiculo = V.id_vehiculo WHERE R.id_usuario = ?";

  pool.query(sql, [req.session.user.id], (err, reservas) => {
    if(err){
      console.error("Error al cargar perfil:", err);
      return res.status(500).send("Error al cargar tu perfil");
    }

    res.render('perfil', {
      titulo: 'GreenRide - Perfil',
      pagina: 'perfil',
      reservas: reservas || []
    });
  });
});

router.get('/mis_reservas', isAuth, (req, res) => {

  //reservas del usuario
 const sql = `SELECT r.* ,v.*, r.estado AS estado_reserva
              FROM reservas r
              LEFT JOIN vehiculos v ON r.id_vehiculo = v.id_vehiculo
              WHERE r.id_usuario = ?
              ORDER BY r.id_reserva ASC`;

  pool.query(sql, [req.session.user.id], (err, resultados) => {
    if(err){
      console.error("Error al cargar perfil:", err);
      return res.status(500).send("Error al cargar tu perfil");
    }

    res.render('mis_reservas', {
      titulo: 'GreenRide - Mis Reservas',
      pagina: 'mis_reservas',
      resultados: resultados || []
    });
  });
});

router.post('/terminar_reserva', (req, res) => {
  const { id_reserva } = req.body;

  if (!id_reserva) {
    return res.status(400).send("Falta id_reserva");
  }

  const sqlSelect = `SELECT fecha_inicio, estado FROM reservas WHERE id_reserva = ?`;

  pool.query(sqlSelect, [id_reserva], (err, results) => {
   
    if (err) {
      console.error("Error obteniendo reserva:", err);
      return res.status(500).send("Error en servidor");
    }

  if (results.length === 0) {
    return res.status(404).send("Reserva no encontrada");
  }

    const reserva = results[0];
    let nuevoEstado;

    const ahora = new Date();
    const fechaInicio = new Date(reserva.fecha_inicio);

    if (reserva.estado === 'finalizada' || reserva.estado === 'cancelada') {
      return res.status(400).send("La reserva ya fue finalizado/cancelado");
    }

    if (fechaInicio < ahora) {
        nuevoEstado = 'finalizada';
    } else {
        nuevoEstado = 'cancelada';
    }

    const sqlUpdate = `
        UPDATE reservas
        SET estado = ?
        WHERE id_reserva = ?`;

    pool.query(sqlUpdate, [nuevoEstado, id_reserva], (err2) => {
      if(err2){
        console.error("Error actualizando reservas:", err2);
         return res.status(500).send("Error en servidor");
      }

      const sqlVehiculo = `UPDATE vehiculos SET estado = 'disponible' WHERE id_vehiculo = (SELECT id_vehiculo FROM reservas WHERE id_reserva = ?)`;

      pool.query(sqlVehiculo, [id_reserva], (err3) => {
        if(err3){
          console.error("Error actualizando vehiculo:", err3);
          return res.status(500).send("Error en servidor");
        }

        res.send(`Reserva actualizada a "${nuevoEstado}"`);
      });

    });

  });
});


module.exports = router;