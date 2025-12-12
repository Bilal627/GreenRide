const express = require('express');
const router = express.Router();
const cargaDinamicaController = require('../controllers/cargaDinamica');
const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({storage: storage});

//Ver si la BBDD esta vacia o no
router.get('/data-check', cargaDinamicaController.dbVacia);

//Carga de concesionarios y admin principal
router.post('/carga-concesionarios-admin', upload.single('archivo_json'), cargaDinamicaController.cargaConcesionariosAdmin);

//Carga de vehiculos
router.post('/carga-vehiculos', upload.single('archivo_json'), cargaDinamicaController.cargaVehiculos);

module.exports = router;