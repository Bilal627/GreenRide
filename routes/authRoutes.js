const express = require('express');
const router = express.Router();
const pool = require('../config/db.js');
const bcrypt = require('bcrypt');

//Ruta para la pagina de login
router.get('/login', (req, res) => {
  res.render('login', {
      titulo: 'GreenRide - Login',
      pagina: 'login'
  });
});

router.post('/perfil',(req,res)=>{


  const {nombre, contrasena ,telefono} = req.body;
  const id = req.session.user.id;
  
  const sql = `
  UPDATE usuarios 
  SET nombre = ?,contrasena = ?, telefono = ?
  WHERE id_usuario = ?`;

  const saltRounds = 10;
  const contrasenaHasheada = bcrypt.hashSync(contrasena, saltRounds);


  const values =[nombre,contrasenaHasheada,telefono, id];


  pool.query(sql,values,(err,result)=>{
    if(err){
      console.error("error en modificar perfil: ", err);
      return res.status(500).send("error en modificar perfil");

    }

    req.session.user.nombre = nombre;
    req.session.user.telefono = telefono;
    req.session.user.contrasena = contrasena;

    console.log("Usuario modificado ");
    res.send("Modoficado correctamente");
  });


})


//Procesar login
router.post('/login',(req,res)=>{
  const {email, password} = req.body;
  
  if(!email || !password){
    return res.status(400).send("Faltan datos obligatorios");
  }

  const correoLimpio = email.trim().toLowerCase();

  const sql = "SELECT * FROM usuarios WHERE correo = ?";

  pool.query(sql, [correoLimpio], (err, results) =>{
    if(err){
      console.log("Error en login:" , err);
      return res.status(500).send("Error en el servidor");
    }

    if(results.length == 0){
      return res.status(401).send("No se encontro el usuario");
    }

    const usuario = results[0];
    
    bcrypt.compare(password, usuario.contrasena, (compareErr, esIgual) => {
      
      if(compareErr){
        console.error("Error al comprar hash:", compareErr);
        return res.status(500).send("Error en el servidor");
      }

      if(esIgual){
        req.session.user = {
        id: usuario.id_usuario,
        nombre: usuario.nombre,
        contrasena: password,
        correo: usuario.correo,
        telefono: usuario.telefono,
        id_concesionario: usuario.id_concesionario,
        rol: usuario.rol,
        contraste: usuario.contraste,
        fuente: usuario.fuente
      }


      console.log("Usuario encontrado: ", usuario.id_usuario);
        
    
      //Actulizar reservas

      const sqlUpdate = `UPDATE reservas SET estado = 'finalizada'
                        WHERE fecha_fin < NOW()
                        AND estado <> 'finalizada'`;

      pool.query(sqlUpdate, (updateErr) => {
        if (updateErr) {
          console.error("Error actualizando reservas vencidas:", updateErr);
        }

        res.json({
        ok: true,
        contraste: usuario.contraste || 'normal',
        fuente: usuario.fuente || 'normal'
        });

      });

      }
      else{
        return res.status(401).send("Correo o contraseña incorrecto");
      }

    });

  });

});

//Pantalla de Registro
router.get('/registro', (req, res) => {
    res.render('registro', {
        titulo: 'GreenRide - Registro',
        pagina: 'registro',
    });
});


router.post('/registro', (req, res) => {

  const { nombre, email, password, telefono, concesionario } = req.body;

  if (!nombre || !email || !password) {
    return res.status(400).send("Faltan datos obligatorios");
  }

  const correoLimpio = email.trim().toLowerCase();
  const correoRegex = /^[A-Za-z0-9._%+-]+@ucm\.es$/;

  if (!correoRegex.test(correoLimpio)) {
    return res.status(400).send("El correo debe pertenecer al dominio @ucm.es");
  }

  if (password.length < 8) {
    return res.status(400).send("La contraseña debe tener al menos 8 caracteres");
  }

  const saltRounds = 10;
  const contrasenaHasheada = bcrypt.hashSync(password, saltRounds);

  const sql = `
    INSERT INTO usuarios (nombre, correo, contrasena, telefono, id_concesionario, rol)
    VALUES (?, ?, ?, ?, ?, 'empleado')`;

  const values = [
    nombre.trim(),
    correoLimpio,
    contrasenaHasheada,
    telefono || null,
    concesionario || null
  ];

  // Ejecutar la consulta
  pool.query(sql, values, (err, result) => {
    if (err) {
      console.error("Error al insertar en la base de datos:", err);

      if (err.code === "ER_DUP_ENTRY") {
        return res.status(400).send("Este correo ya está registrado");
      }

      return res.status(500).send("Error al registrar el usuario");
    }

    console.log("Usuario registrado correctamente con ID: ", result.insertId);
   res.json({ ok: true }); 
  });
});

//Ruta para la pagina de cerrar sesion
router.get('/cerrar', (req, res)=>{
  req.session.destroy(() => res.redirect('/'));
});

router.put('/guardarAccesibilidad',(req,res)=>{
  const {contrast,fontSize} = req.body;
  const id = req.session.user.id;

  const contrastValues = ['normal', 'high-contrast', 'daltonismo'];
  const fontSizeValues = ['pequeño', 'normal', 'grande'];

  if (!contrastValues.includes(contrast) || !fontSizeValues.includes(fontSize)) {
    return res.status(400).send("Valores inválidos para contraste o tamaño de fuente");
  }

  const sql=`UPDATE usuarios 
    SET contraste = ?, fuente = ?
    WHERE id_usuario = ?`;

  const value=[contrast, fontSize,id];
  
  pool.query(sql, value, (err, result) => {
    if (err) {
      console.error("Error al actualizar accesibilidad:", err);
      return res.status(500).send("Error al guardar accesibilidad");
    }

    res.json({ ok: true });
  });

});

module.exports = router;