const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const mysql = require('mysql');
const jwt = require('jsonwebtoken'); // Importar jsonwebtoken
const nodemailer = require('nodemailer'); // Importar nodemailer
const crypto = require('crypto');

// Función para generar un token de 6 caracteres aleatorios
function generateToken() {
    return crypto.randomBytes(3).toString('hex');  // Genera 6 caracteres hexadecimales
}

// Ruta GET /verifyToken
router.get('/verifyToken', (req, res) => {
    const user = req.session.user; // O la forma en que tienes almacenado el usuario

    if (!user) {
        return res.redirect('/login'); // Redirigir si no está autenticado
    }

    // Pasar la variable 'user' y un valor vacío para 'error' (si no hay error)
    res.render('verifyToken', { user, error: null });
});

router.post('/verifyToken', (req, res) => {
    const { token } = req.body;
    const user = req.session.user; // Obtener el usuario desde la sesión

    // Verificar si el token está presente
    if (!token) {
        return res.render('verifyToken', { user, error: 'Token no proporcionado' });
    }

    // Verificar el token
    if (token !== req.session.token) {
        return res.render('verifyToken', {
            user,
            error: 'El token es inválido o ha expirado. Intenta nuevamente.'
        });
    }
    // Verificar si el token ha expirado
    if (Date.now() > req.session.tokenExpiration) {
        return res.render('verifyToken', {
            user,
            error: 'El token ha expirado. Solicita uno nuevo.'
        });
    }
    // Si el token es válido, guardar la verificación en la sesión
    req.session.tokenVerified = true;

    // Redirigir al usuario a la página de clientes
    return res.redirect('/customers');
});



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

// Configuración de nodemailer (puedes usar un servicio como Gmail, SendGrid, etc.)
const transporter = nodemailer.createTransport({
    service: 'gmail',  // O el servicio de correo que estés usando
    auth: {
        user: 'pedro951214@gmail.com',  // Tu correo de Gmail
        pass: 'qdie ifam gyor ffcj'

        // Tu contraseña de Gmail (es preferible usar un App Password si tienes habilitada la verificación en dos pasos)
    }
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

                    req.session.user = user;


                    // Generar un token de acceso (puedes usar JWT o un token aleatorio)
                    const token = generateToken();

                    // Guardar el token y su expiración en la sesión
                    req.session.token = token;
                    req.session.tokenExpiration = Date.now() + 3600000; // 1 hora

                    // Eliminar el token después de 1 hora (3600000 ms)
                    setTimeout(() => {
                        delete req.session.token;
                        delete req.session.tokenExpiration;
                    }, 3600000);  // 1 hora en milisegundos

                    // Enviar el token por correo electrónico
                    const mailOptions = {
                        from: 'pedro951214@gmail.com',
                        to: user.email,
                        subject: 'Tu token de acceso',
                        text: `Hola ${user.name},\n\nTu token de acceso es: ${token}\n\nEste token es válido por 1 hora.`
                    };

                    transporter.sendMail(mailOptions, (error, info) => {
                        if (error) {
                            return res.send('Error al enviar el correo');
                        }
                        console.log('Correo enviado: ' + info.response);
                    });

                    // Redirigir al usuario a la página donde ingresará el token
                    res.redirect('/verifyToken');
                } else {
                    res.render('login', { error: 'Contraseña incorrecta' });
                }
            }
        );
    });
});

router.get('/customers', (req, res) => {
    // Verificar si el usuario ha introducido y verificado el token
    if (!req.session.tokenVerified) {
        return res.redirect('/verifyToken'); // Si no ha verificado el token, redirigir a /verifyToken
    }

    // Obtener el token de la sesión
    const { token } = req.session;

    if (!token) {
        return res.redirect('/login'); // Si no hay token, redirigir al login
    }
    // Verificar el token
    if (token !== req.session.token) {
        return res.redirect('/login'); // Si el token no coincide, redirigir al login
    }

    // Obtener la lista de clientes desde la base de datos
    req.getConnection((err, connection) => {
        if (err) return res.send(err);

        connection.query('SELECT * FROM customer', (err, customers) => {
            if (err) return res.send(err);

            // Renderizar la vista 'customers.ejs' pasando los datos de los clientes
            res.render('customers', { data: customers });
        });
    });
});

router.get('/pqr', (req, res) => {
    res.render('pqr'); // renderiza la vista de registro
});

// Ruta para manejar el formulario de PQR (queja o solicitud)
router.post('/pqr', (req, res) => {
    const { name, email, complaint_type, complaint_text } = req.body;

    // Verificar que todos los campos estén presentes
    if (!name || !email || !complaint_type || !complaint_text) {
        return res.render('pqr', { error: 'Por favor completa todos los campos del formulario.' });
    }

    // Configurar el correo para enviar la queja
    const mailOptions = {
        from: email, // El correo del usuario que envía la queja
        to: 'pedro951214@gmail.com', // El correo de destino
        subject: `Nueva queja o solicitud: ${complaint_type}`,
        text: `
            Nombre: ${name}
            Correo: ${email}
            Tipo de queja o solicitud: ${complaint_type}
            Descripción: ${complaint_text}
        `
    };

    // Enviar el correo
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
            return res.render('pqr', { error: 'Hubo un problema al enviar tu queja. Intenta nuevamente.' });
        }
        console.log('Correo enviado: ' + info.response);
        return res.render('pqr', { success: 'Tu queja ha sido enviada exitosamente.' });
    });
});



module.exports = router;
