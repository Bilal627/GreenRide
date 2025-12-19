# 🚗 GreenRide: Plataforma de Gestión de Flotas Eléctricas

## 🌟 Resumen del Proyecto

Plataforma Full Stack desarrollada en arquitectura **MVC (Modelo-Vista-Controlador)** para la gestión completa del ciclo de vida de una flota de vehículos eléctricos. El sistema incluye autenticación segura, control de acceso basado en roles (RBAC) y un módulo de reservas que gestiona la concurrencia en la Base de Datos.

**La lógica de inicialización de la base de datos se maneja internamente en el servidor (Node.js) a partir de archivos JSON.**

---

## 🛠️ Tecnologías Utilizadas

| Categoría | Tecnología | Rol Principal |
| :--- | :--- | :--- |
| **Backend** | Node.js, Express | Servidor, Lógica de Negocio, API RESTful |
| **Base de Datos** | MySQL | Persistencia de datos, control de transacciones (reservas) |
| **Frontend** | EJS (Server-Side Rendering) | Renderizado dinámico de vistas y plantillas |
| **Seguridad** | Bcrypt | Cifrado de contraseñas |

---

## 🔑 Flujo de Inicialización de la BBDD (CRÍTICO)

La aplicación usa la lógica de Node.js para crear las tablas e insertar datos iniciales:

1.  **Tablas Clave:** Se crean dinámicamente las tablas principales (`usuarios`, `vehiculos`, `reservas`, etc.) con sus claves foráneas (`ON DELETE RESTRICT`).
2.  **Carga de Datos:** El servidor carga automáticamente los datos iniciales para el administrador y la flota desde los archivos **`estructura.json`** y **`vehiculos.json`**.
3.  **Configuración de BBDD:** Necesitas tener la base de datos `greenride` lista en XAMPP o MySQL para que Node.js pueda conectarse y trabajar.

---

## 🚀 Guía de Instalación y Ejecución

### 1. Requisitos Previos

Asegúrate de tener instalado:
* [Node.js](https://nodejs.org/) (Versión 18 o superior)
* [MySQL Server](https://www.mysql.com/downloads/mysql-server/) o **XAMPP**

### 2. Base de Datos (MySQL/XAMPP)

1.  **Prepara la BBDD:** Crea una base de datos vacía llamada **`greenride`** en tu entorno MySQL o XAMPP.
2.  **Archivos de Datos:** Asegúrate de que los archivos **`estructura.json`** y **`vehiculos.json`** estén en la ruta esperada por la aplicación (estan en la carpeta `Documentos JSON de carga`).

### 3. Configuración del Servidor

1.  En la raíz del proyecto, crea un archivo de configuración (ej: **`config.js`**).
2.  Introduce tus credenciales de MySQL/XAMPP para la conexión:

    ```javascript
    // config.js
    module.exports = {
        DB_HOST: 'localhost',
        DB_USER: '<TU_USUARIO_MYSQL>', 
        DB_PASSWORD: '<TU_CONTRASEÑA_MYSQL>', // Puede estar vacía si usas root de XAMPP sin contraseña
        DB_NAME: 'greenride' 
    };
    ```

### 4. Ejecución

1.  Instala todas las dependencias listadas en `package.json`:
    ```bash
    npm install
    ```
2.  Inicia el servidor de Node.js:
    ```bash
    npm start o node app.js
    ```

**El servidor se conectará, creará las tablas, cargas los JSON y luego iniciará la aplicación.**

El sistema estará accesible en `http://localhost:3000`.

---

## 🔑 Credenciales de Prueba

| Rol | Correo Electrónico | Contraseña |
| :--- | :--- | :--- |
| **Administrador** | `admin@ucm.es` | admin1234 |

---

## 👤 Autor

* **Bilal El Mourabit El Mourabiti**
*  **Jiayun Zhan**
