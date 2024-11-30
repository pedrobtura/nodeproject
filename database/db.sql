-- Crear la base de datos
CREATE DATABASE IF NOT EXISTS crudnodemysql;

-- Usar la base de datos
USE crudnodemysql;

-- Crear la tabla 'customer'
CREATE TABLE IF NOT EXISTS customer (
    id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    address VARCHAR(100) NOT NULL,
    phone VARCHAR(15)
);

-- Crear la tabla 'users'
CREATE TABLE IF NOT EXISTS users (
    id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ver todas las tablas creadas
SHOW TABLES;

-- Describir la tabla 'customer' (opcional)
DESCRIBE customer;
