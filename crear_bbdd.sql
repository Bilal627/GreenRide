CREATE DATABASE IF NOT EXISTS greenride CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE greenride;

CREATE TABLE concesionarios (
  id_concesionario INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  ciudad VARCHAR(100) NOT NULL,
  direccion VARCHAR(255) DEFAULT NULL,
  telefono_contacto VARCHAR(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


CREATE TABLE usuarios (
  id_usuario INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  correo VARCHAR(255) NOT NULL UNIQUE,
  contrasena VARCHAR(255) NOT NULL,
  telefono VARCHAR(15) DEFAULT NULL,
  id_concesionario INT UNSIGNED DEFAULT NULL,
  rol ENUM('empleado', 'admin') NOT NULL DEFAULT 'empleado',
  contraste VARCHAR(20) DEFAULT 'normal', -- antes es_contraste BOOLEAN
  fuente ENUM('pequeno', 'normal', 'grande') DEFAULT 'normal',
  FOREIGN KEY (id_concesionario)
    REFERENCES concesionarios(id_concesionario)
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE vehiculos (
  id_vehiculo INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  matricula VARCHAR(20) NOT NULL UNIQUE,
  marca VARCHAR(50) NOT NULL,
  modelo VARCHAR(50) NOT NULL,
  ano_matriculacion YEAR NOT NULL,
  numero_plazas TINYINT UNSIGNED NOT NULL,
  autonomia_km INT UNSIGNED DEFAULT NULL,
  color VARCHAR(30) DEFAULT NULL,
  imagen VARCHAR(255) DEFAULT NULL,
  estado ENUM('disponible', 'reservado', 'mantenimiento') DEFAULT 'disponible',
  id_concesionario INT UNSIGNED NOT NULL,
  FOREIGN KEY (id_concesionario)
    REFERENCES concesionarios(id_concesionario)
    ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE reservas (
  id_reserva INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_usuario INT UNSIGNED NOT NULL,
  id_vehiculo INT UNSIGNED NOT NULL,
  fecha_inicio DATETIME NOT NULL,
  fecha_fin DATETIME NOT NULL,
  estado ENUM('activa', 'finalizada', 'cancelada') DEFAULT 'activa',
  kilometros_recorridos INT UNSIGNED DEFAULT NULL,
  incidencias_reportadas TEXT DEFAULT NULL,
  FOREIGN KEY (id_usuario)
    REFERENCES usuarios(id_usuario)
    ON DELETE RESTRICT,
  FOREIGN KEY (id_vehiculo)
    REFERENCES vehiculos(id_vehiculo)
    ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


