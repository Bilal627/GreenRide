const express = require('express');
const router = express.Router();
const pool = require('../config/db.js');
const { isAdmin } = require('./middlewareRoutes.js');

function query(sql, params){
  return new Promise((resolver, reject) => {
    pool.query(sql, params, (error, results) => {
      if(error) reject(error);
      else resolver(results);
    });
  });
}

router.get('/adminIni', isAdmin, async (req, res) => {
  try{
    const totalReservas = "SELECT COUNT(*) as total FROM reservas";

    const topCoche = `SELECT v.marca, v.modelo, v.matricula, v.imagen, COUNT(r.id_reserva) as total_usos
                      FROM vehiculos v JOIN reservas r ON v.id_vehiculo = r.id_vehiculo GROUP BY v.id_vehiculo ORDER BY total_usos DESC LIMIT 1`;
                      
    const reservasPorConcesionario = `SELECT c.nombre, COUNT(r.id_reserva) AS num_reservas FROM concesionarios c LEFT JOIN vehiculos v ON c.id_concesionario = v.id_concesionario
                                      LEFT JOIN reservas r ON v.id_vehiculo = r.id_vehiculo GROUP BY c.id_concesionario ORDER BY num_reservas DESC`;

    const [total, top, reservas] = await Promise.all([
      query(totalReservas), query(topCoche), query(reservasPorConcesionario)
    ]);  
  
    res.render('admin/adminIni', {
        titulo: 'GreenRide - Admin',
        pagina: 'adminIni',
        stats: {
          total: total[0].total,
          topVehiculo: top.length > 0 ? top[0] : null,
          concesionarios: reservas
        }
    });
  }catch(error){
    console.error("Error en las estadisticas:", error);
    res.status(500).send("Error cargando el panel de estadisticas");
  }
});


router.get('/editarUsuarios', (req, res) => {
    res.render('admin/editarUsuarios', {
        titulo: 'GreenRide - editarUsuarios',
        pagina: 'editarUsuarios'
    });
});


router.get('/altaConcesionarios', (req, res) => {
    res.render('admin/altaConcesionarios', {
        titulo: 'GreenRide - altaConcesionarios',
        pagina: 'altaConcesionarios'
    });
});

router.get('/eliminarConcesionarios', (req, res) => {
    res.render('admin/eliminarConcesionarios', {
        titulo: 'GreenRide - eliminarConcesionarios',
        pagina: 'eliminarConcesionarios'
    });
});

router.get('/editarConcesionarios', (req, res) => {
    res.render('admin/editarConcesionarios', {
        titulo: 'GreenRide - editarConcesionarios',
        pagina: 'editarConcesionarios'
    });
});

router.get('/adminReservas', (req, res) => {


  const sql = `SELECT r.* ,v.*, r.estado AS estado_reserva
              FROM reservas r
              LEFT JOIN vehiculos v ON r.id_vehiculo = v.id_vehiculo
              ORDER BY r.id_reserva ASC`;

  pool.query(sql, (err, resultados) => {
    if(err){
      console.error("Error al cargar reservas:", err);
      return res.status(500).send("Error al cargar reservas");
    }

    res.render('admin/adminReservas', {
      titulo: 'GreenRide - adminReservas',
      pagina: 'adminReservas',
      resultados: resultados || []
    });
  });
});

router.post('/reservasIncidenciasKm', (req, res) => {
    const { id_reserva, incidencia ,km_recorrido} = req.body;

    const sql = `UPDATE reservas 
                SET incidencias_reportadas = ? ,kilometros_recorridos = ?
                WHERE id_reserva = ?`;

    pool.query(sql, [incidencia, km_recorrido,id_reserva], (err, result) => {
        if (err) {
            console.error("Error al guardar incidencia:", err);
            return res.status(500).send("Error al guardar incidencia");
        }

        res.redirect('/adminReservas'); // Volver a la página de reservas
    });
});

router.get('/altaVehiculos', (req, res) => {
    res.render('admin/altaVehiculos', {
        titulo: 'GreenRide - altaVehiculos',
        pagina: 'altaVehiculos'
    });
});

router.get('/bajaVehiculos', (req, res) => {
    res.render('admin/bajaVehiculos', {
        titulo: 'GreenRide - bajaVehiculos',
        pagina: 'bajaVehiculos'
    });
});

router.get('/editarVehiculos', (req, res) => {
    res.render('admin/editarVehiculos', {
        titulo: 'GreenRide - editarVehiculos',
        pagina: 'editarVehiculos'
    });
});

router.get('/listarConcesionarios', isAdmin, (req, res) => {
  const sql = `SELECT id_concesionario, nombre, ciudad, direccion, telefono_contacto FROM Concesionarios ORDER BY id_concesionario ASC;`;

  pool.query(sql, (err, concesionarios) => {
    if(err){
      console.error("Error al listar concesionarios:", err);

      return res.render('error', {
        titulo: 'Error',
        message: 'Error al obtener la lista de conesionarios.'
      });
    }

    res.render('admin/listarConcesionarios', {
      titulo: 'GreenRide - Listado de Concesionarios',
      pagina: 'listarConcesionarios',
      concesionarios: concesionarios
    });
  });

});

router.post('/altaConcesionarios', (req, res) => {

  const { nombre, ciudad, direccion, telefono } = req.body;

  if (!nombre || !ciudad || !direccion || !telefono) {
    return res.status(400).send("Faltan datos obligatorios");
  }


  const sql = `
    INSERT INTO concesionarios(nombre, ciudad, direccion, telefono_contacto)
    VALUES (?, ?, ?, ?)`;

  const values = [
    nombre,
    ciudad,
    direccion,
    telefono
  ];

  // Ejecutar la consulta
  pool.query(sql, values, (err, result) => {
    if (err) {
      console.error("Error al insertar en la base de datos:", err);

      return res.status(500).send("Error al registrar el usuario");
    }

    console.log("Concesionario registrado correctamente con ID: ", result.insertId);
    res.json({ ok: true }); 
  });
});

router.put('/editarConcesionarios',(req,res) =>{
  const {id, nombre,ciudad,direccion,telefono} = req.body;

  if(!id || !nombre || !ciudad || !direccion || !telefono){
    return res.status(400).send("Faltan datos");
  }

  try{
    const sql=`UPDATE concesionarios
    SET nombre = ?, ciudad = ?, direccion = ?, telefono_contacto = ?
    WHERE id_concesionario = ?`;

    const values=[nombre, ciudad, direccion, telefono,id];

    pool.query(sql,values,(err, result)=>{

      if (err) {
      console.error("Error al insertar en la base de datos:", err);

      return res.status(500).send("Error al registrar el usuario");
      
      }

      console.log("Concesionario editado correctamente con ID: ", result.id);
      res.json({ ok: true }); 

    });

  }catch(err){
    console.error(err);
    res.status(500).send("Error del servidor");
  }
});

router.delete('/eliminarConcesionarios',(req,res)=>{
  const {id}=req.body;
  if(!id) return res.status(400).send("Falta ID");

  const sql =`DELETE FROM concesionarios WHERE id_concesionario = ?`;
  const values = [id];
  pool.query(sql, values, (err,result)=>{
    if(err){
      console.error("Error en eliminar concesionario",err);
      return res.status(500).send("Error en eliminar concesionario");

    }


    if(result.affectedRows == 0){
      return res.status(404).send("Concesionario no existente");
    }

    console.log("Concesionario eliminado correctamente");
    res.json({ok:true});
  });
});


router.put('/editarUsuarios',(req,res) =>{
  const {id, id_concesionario,rol} = req.body;

  if(!id || !id_concesionario || !rol){
    return res.status(400).send("Faltan datos");
  }

  try{
    const sql=`UPDATE usuarios
    SET id_concesionario =?,rol=?
    WHERE id_usuario = ?`;


    const values=[id_concesionario, rol, id];

    pool.query(sql,values,(err, result)=>{

      if (err) {
      console.error("Error en la base de datos:", err);

      return res.status(500).send("Error al modifcar usuario");
      
      }

      console.log("Concesionario editado correctamente con ID: ", id);
      res.json({ ok: true }); 

    });

  }catch(err){
    console.error(err);
    res.status(500).send("Error del servidor");
  }
});


router.get('/listarUsuarios',isAdmin, (req, res) =>{
  const sql = `SELECT u.id_usuario, u.nombre, u.correo, u.telefono, u.rol, c.nombre AS nombre_concesionario FROM Usuarios u LEFT JOIN Concesionarios c ON u.id_concesionario = c.id_concesionario ORDER BY u.id_usuario ASC;`;

  pool.query(sql, (err, usuarios) => {
    if(err){
      console.error("Error al listar usuarios", err);

      return res.render('error', {
        titulo: 'Error',
        message: 'Error al obtener la lista de usuarios.'
      });
    }

    res.render('admin/listarUsuarios', {
      titulo: 'GreenRide - Listado de Usuarios',
      pagina: 'listadoUsuarios',
      usuarios: usuarios
    });
  });
} );

router.post('/altaVehiculos', (req, res) => {
  const { matricula, marca, modelo, ano_matriculacion, numero_plazas, autonomia_km, color, imagen, estado, id_concesionario } = req.body;

  if (!matricula || !marca || !modelo || !ano_matriculacion || !numero_plazas || !autonomia_km || !color || !imagen || !estado || !id_concesionario) {
    return res.status(400).send("Faltan datos obligatorios");
  }

  const sql = `
    INSERT INTO vehiculos
    (matricula, marca, modelo, ano_matriculacion, numero_plazas, autonomia_km, color, imagen, estado, id_concesionario)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    matricula,
    marca,
    modelo,
    parseInt(ano_matriculacion),
    parseInt(numero_plazas),
    parseInt(autonomia_km),
    color,
    imagen,
    estado,
    parseInt(id_concesionario)
  ];

  pool.query(sql, values, (err, result) => {
    if (err) {
      console.error("Error al insertar en la base de datos:", err.sqlMessage);
      return res.status(500).send("Error al registrar el vehículo");
    }

    console.log("Vehículo registrado correctamente con ID: ", result.insertId);
    res.json({ ok: true });
  });
});


router.put('/bajaVehiculos',(req,res)=>{
  const {id}=req.body;
  if(!id) return res.status(400).send("Falta ID");

  const sql = `UPDATE vehiculos SET estado = 'mantenimiento' WHERE id_vehiculo = ?`;
  const values = [id];
  pool.query(sql, values, (err,result)=>{
    if(err){
      console.error("Error en baja vehiculo",err);
      return res.status(500).send("Error en baja vehiculo");

    }


    if(result.affectedRows == 0){
      return res.status(404).send("vehiculo no existente");
    }

    console.log("Vehiculo bajado correctamente");
    res.json({ok:true});
  });
});

router.put('/editarVehiculos', (req, res) => {
  const {
    id_vehiculo,
    matricula,
    marca,
    modelo,
    ano_matriculacion,
    numero_plazas,
    autonomia_km,
    color,
    imagen,
    estado,
    id_concesionario
  } = req.body;


  if (!id_vehiculo || !matricula || !marca || !modelo || !ano_matriculacion ||
      !numero_plazas || !autonomia_km || !color || !imagen || !estado || !id_concesionario) {
    return res.status(400).send("Faltan datos obligatorios");
  }

  try {
    const sql = `
      UPDATE vehiculos
      SET matricula = ?, marca = ?, modelo = ?, ano_matriculacion = ?, numero_plazas = ?,
          autonomia_km = ?, color = ?, imagen = ?, estado = ?, id_concesionario = ?
      WHERE id_vehiculo = ?`;

    const values = [
      matricula,
      marca,
      modelo,
      ano_matriculacion,
      numero_plazas,
      autonomia_km,
      color,
      imagen,
      estado,
      id_concesionario,
      id_vehiculo
    ];

    pool.query(sql, values, (err, result) => {
      if (err) {
        console.error("Error al actualizar vehiculo:", err);
        return res.status(500).send("Error al editar el vehiculo");
      }

      if (result.affectedRows === 0) {
        return res.status(404).send("Vehiculo no encontrado");
      }

      console.log("Vehiculo editado correctamente con ID:", id_vehiculo);
      res.json({ ok: true });
    });

  } catch (err) {
    console.error(err);
    res.status(500).send("Error del servidor");
  }
});



module.exports = router;