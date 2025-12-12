const pool = require('../config/db');

//Fucnion para comprobar consultas
function query(sql, params){
    return new Promise((resolver, reject) => {
        pool.query(sql, params, (error, results) => {
            if(error){
                console.error("Error al ejecutar consulta SQL:", sql, params, error);
                return reject(error);
            }
            resolver(results);
        });
    });
}


//acceso a la base de datos
const db = {
    numConcesionarios: async() => {
        const results = await query('SELECT COUNT(*) AS c FROM Concesionarios');
        return results[0].c;
    },
    numVehiculos: async() =>{
        const results = await query('SELECT COUNT(*) AS v FROM Vehiculos');
        return results[0].v;
    },
    getConcesionarioId: async(nombre) => {
        const results = await query('SELECT id_concesionario FROM Concesionarios WHERE nombre = ?', [nombre]);
        return results.length > 0 ? results[0].id_concesionario : null;
    },
    getVehiculoByMatricula: async(matricula) => {
        const results = await query('SELECT * FROM Vehiculos WHERE matricula = ?', [matricula]);
        return results.length > 0 ? results[0] : null;
    },
    getUserByEmail: async(correo) => {
        const results = await query('SELECT * FROM Usuarios WHERE correo = ?', [correo]);
        return results.length > 0 ? results[0] : null;
    },

    insertUser: async (userData) => {
        const sql = `INSERT INTO Usuarios (nombre, correo, contrasena, telefono, rol, id_concesionario) VALUES (?, ?, ?, ?, ?, ?)`;
        const params = [
            userData.nombre, userData.correo, userData.contrasena, userData.telefono, userData.rol, userData.id_concesionario
        ];
        await query(sql, params);
    },

    insertConcesionario: async(data) =>{
        const sql = 'INSERT INTO Concesionarios (nombre, ciudad, direccion, telefono_contacto) VALUES (?, ?, ?, ?)';
        const params = [data.nombre, data.ciudad, data.direccion, data.telefono_contacto];
        const results = await query(sql, params);
        return results.insertId;
    },
    insertVehiculo: async(data) => {
        const sql = `INSERT INTO Vehiculos (matricula, marca, modelo, ano_matriculacion, numero_plazas, autonomia_km, color, imagen, estado, id_concesionario) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        const params = [
            data.matricula, data.marca, data.modelo, data.ano_matriculacion, data.numero_plazas,
            data.autonomia_km, data.color, data.imagen, data.estado, data.id_concesionario
        ];
        await query(sql, params);
    },
    updateVehiculo: async(id_vehiculo, data) => {
        const sql = `UPDATE Vehiculos SET marca=?, modelo=?, ano_matriculacion=?, numero_plazas=?, autonomia_km=?, color=?, imagen=?, estado=?, id_concesionario=? WHERE id_vehiculo = ?`;
        const params = [
            data.marca, data.modelo, data.ano_matriculacion, data.numero_plazas, data.autonomia_km,
            data.color, data.imagen, data.estado, data.id_concesionario, id_vehiculo
        ];
        await query(sql, params);
    }

};

//Middleware para ver si la base de datos esta vacia o no
exports.dbVacia = async (req, res, next) => {
    try{
        const numC = await db.numConcesionarios();
        const numV = await db.numVehiculos();

        if (numC > 0 && numV > 0) {
            return next(); 
        }

        let step = 1;
        let message = '⚠️ BBDD vacía.';
        let title = 'Carga Inicial';

        if(numC > 0 && numV === 0){
            step = 2;
            title: 'Carga de Vehiculos.';
            message: 'Carga los Vehiculos.';

        }
        else if(numC > 0 && numV > 0){
            step = 3;
            title: 'Sistema Listo';
            message: '✅ La BBDD contiene datos. Puedes añadir más o actualizar.';
        }

        return res.render('cargaDinamica', {
                title: title,
                message: message,
                step: step,
                logs: []
        });
    }
    catch(error){
        console.error(error);
        return res.status(500).send("Error de base de datos");
    }
};

//Carga de Admin y Concesionarios
exports.cargaConcesionariosAdmin = async (req, res) =>{
    let logs = [];

    try{
        if(!req.file) throw new Error("No has subido ningun archivo JSON.");
    
    const data = JSON.parse(req.file.buffer.toString('utf-8'));

    //Admin
    if(data.admin_inicial){
        const existe = await db.getUserByEmail(data.admin_inicial.correo);
        if(!existe){
            await db.insertUser(data.admin_inicial);
            logs.push(`✅ Admin creado: ${data.admin_inicial.correo}`);
        }
        else{
            logs.push(`🔄 Admin ya existe: ${data.admin_inicial.correo}`);
        }
    }

    //Concesionarios
    if(data.concesionarios){
        for(const c of data.concesionarios){
            const idExistente = await db.getConcesionarioId(c.nombre);
            if(!idExistente) {
                const newId = await db.insertConcesionario(c);
                logs.push(`✅ Concesionario creado: ${c.nombre} (ID: ${newId})`);
            }
            else{
                logs.push(`🔄 Concesionario ya existe: ${c.nombre} (ID: ${idExistente})`);
            }
        }
    }
    
    res.render('cargaDinamica', {title: 'Resultado Carga Administrador y Concesionarios', message: 'Proceso finalizado', step: 2, logs});

    }catch(e){
        logs.push(`❌ Error: ${e.message}`);
        res.render('cargaDinamica', {title: 'Error', message: 'Algo ha fallado', logs});
    }
};

exports.cargaVehiculos = async (req, res) =>{
    let logs = [];
    try{
        if(!req.file) throw new Error("No has subido ningún archivo JSON.");

        const data = JSON.parse(req.file.buffer.toString('utf-8'));

        if(!data.vehiculos || !Array.isArray(data.vehiculos)){
            throw new Error("El JSON debe contener un array llamado 'vehiculos'.");
        }

        for(const v of data.vehiculos){
            const nombreConcesionario = v.nombre_concesionario || v.concesionario;

            if(!nombreConcesionario){
                logs.push(`❌ Saltado vehículo ${v.matricula}: Falta indicar el 'nombre_concesionario' en el JSON.`);
                continue;
            }

            const idConcesionario = await db.getConcesionarioId(nombreConcesionario);

            if(!idConcesionario){
                logs.push(`❌ Error vehículo ${v.matricula}: El concesionario '${nombreConcesionario}' NO EXISTE en la BBDD. Cargalo primero.`);
                continue;
            }

            const vehiculoData = { ...v, id_concesionario: idConcesionario};

            const existe = await db.getVehiculoByMatricula(v.matricula);

            if(existe){
                await db.updateVehiculo(existe.id_vehiculo, vehiculoData);
                logs.push(`🔄 Actualizado: ${v.matricula} -> ${nombreConcesionario}` );
            }
            else{
                await db.insertVehiculo(vehiculoData);
                logs.push(`✅ Insertado: ${v.matricula} -> ${nombreConcesionario}` );
            }
        }

        res.render('cargaDinamica', {title: 'Resultado Vehiculos', message: 'Proceso finalizado', step: 3, logs});
    }
    catch(e){
        logs.push(`❌ Error: ${e.message}`);
        res.render('cargaDinamica', {title: 'Error', message: 'Algo ha fallado', logs});
    }
};