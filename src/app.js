const express=require('express');
const path = require('path');
const morgan =require('morgan');
const myConnection=require('express-myconnection');
const mysql=require('mysql');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const app=express();

const authRoutes = require('./routes/auth'); // Ajusta la ruta según corresponda

//importar rutas
const customerRoutes=require('./routes/customer')

// configuraciones 
app.set("port", process.env.PORT || 3000);
app.set("view engine", "ejs");//vistas  
app.set("views", path.join(__dirname, "views")); //rutas de las vistas con path

//middleware

app.use(morgan("dev"));
app.use(myConnection(mysql,{
    host:'localhost',
    user:'nuclearadmin',
    password:'nuclearadmin123',
    port:3306,
    database:'crudnodemysql'
},'single'));
app.use(express.urlencoded({ extended: false }));
app.use(session({
    secret: 'mysecretkey',
    resave: false,
    saveUninitialized: true
}));

// middleware para pasar 'user' a todas las vistas
app.use((req, res, next) => {
    res.locals.user = req.session.user || null; // Establece 'user' en res.locals
    next();
});


// rutas


app.get('/', (req, res) => {
    res.render('login'); // O la vista que deseas renderizar, como 'register' o 'login'
});
app.use('/', authRoutes); // Usamos las rutas de auth.js para /register y /login
app.use('/', customerRoutes);

// archivos estaticos imagenes,stilos framework 
app.use(express.static(path.join(__dirname, "public")));

//iniciar servidor
app.listen(3000,()=>{
    console.log("servidor arriba y funcionando")
})


