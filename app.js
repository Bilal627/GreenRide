//IMPORTACIONES
const express = require('express');
const path = require('path');
const cors = require('cors');
const session = require("express-session");
const cargaDinamicaController = require('./controllers/cargaDinamica');
const cargaDinamicaRoutes = require('./routes/cargaDinamicaRoutes');
//INICIALIZACION
const app = express();
const PORT = 3000;

//CONFIGURACION (middlewares)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(cors());


app.use(session({
    secret: 'clave_super_secreta',
    resave: false,
    saveUninitialized: false,
    cookie:{ maxAge: 1000*60*60}
}));

app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

//RUTAS
app.use(cargaDinamicaRoutes); 
app.use('/', cargaDinamicaController.dbVacia);
app.use('/api', require('./routes/apiRoutes')); // las Rutas API
app.use('/', require('./routes/authRoutes')); //Login y Registro
app.use('/', require('./routes/reservasRoutes')); //Reservas y Perfil
app.use('/', require('./routes/adminRoutes')); //Rutas de admin
app.use('/', require('./routes/indexRoutes')); //Inicio y listados publicos(vehiculos)

//ERROR 404
app.use((req, res, next) =>{
    res.status(404).render('error', {
        titulo: "Pagina no encontrada",
        pagina: "error"
    });
});

//INICIAR EL SERVIDOR
app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
