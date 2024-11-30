const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const mysql = require('mysql');

// Ruta para mostrar el formulario de registro
router.get('/register', (req, res) => {
    res.render('register'); // renderiza la vista de registro
});

// Ruta para manejar el registro de un nuevo usuario
router.post('/register', async (req, res) => {
    const { name, email, password, repeat_password } = req.body;
    
    // Verifica que las contraseñas coincidan
    if (password !== repeat_password) {
        return res.render('register', { error: 'Las contraseñas no coinciden' });
    }

    // Encriptar la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insertar usuario en la base de datos
    req.getConnection((err, connection) => {
        if (err) return res.send(err);

        connection.query(
            'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
            [name, email, hashedPassword],
            (err, results) => {
                if (err) {
                    return res.render('register', { error: 'Este correo ya está en uso' });
                }
                res.redirect('/login'); // Redirige al login
            }
        );
    });
});

// Ruta para mostrar el formulario de login
router.get('/login', (req, res) => {
    res.render('login'); // renderiza la vista de login
});

// Ruta para manejar el login del usuario
router.post('/login', (req, res) => {
    const { email, password } = req.body;

    // Buscar el usuario en la base de datos
    req.getConnection((err, connection) => {
        if (err) return res.send(err);

        connection.query(
            'SELECT * FROM users WHERE email = ?',
            [email],
            async (err, results) => {
                if (err) return res.send(err);
                
                if (results.length === 0) {
                    return res.render('login', { error: 'El correo electrónico no está registrado' });
                }

                const user = results[0];
                const match = await bcrypt.compare(password, user.password);
                
                if (match) {
                    // Iniciar sesión (puedes usar session)
                    req.session.user = user;
                    res.redirect('/customers'); // Redirige a la página principal
                } else {
                    res.render('login', { error: 'Contraseña incorrecta' });
                }
            }
        );
    });
});

// Ruta para mostrar los datos de los clientes después de iniciar sesión
router.get('/customers', (req, res) => {
    // Verificar si el usuario está autenticado
    if (!req.session.user) {
        return res.redirect('/login'); // Si no está autenticado, redirigir al login
    }

    // Obtener la lista de clientes desde la base de datos
    req.getConnection((err, connection) => {
        if (err) return res.send(err);

        connection.query('SELECT * FROM customer', (err, customers) => {
            if (err) return res.send(err);
            
            // Renderizar la vista 'customers.ejs' pasando los datos de los clientes
            res.render('customers', { data: customers, user: req.session.user });
        });
    });
});

// Ruta de logout usando express-session
router.get('/logout', (req, res) => {
    // Destruir la sesión
    req.session.destroy((err) => {
        if (err) {
            console.error("Error al destruir la sesión", err);
            return res.redirect('/customers');  // Si ocurre algún error, redirigir a la página principal
        }
        res.redirect('/login');  // Redirige al login después de cerrar sesión
    });
});


module.exports = router;
