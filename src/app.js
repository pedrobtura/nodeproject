const express=require('express');
const path = require('path');
const morgan =require('morgan');
const myConnection=require('express-myconnection');
const mysql=require('mysql');
const app=express();


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

// rutas
app.use('/', customerRoutes);

// archivos estaticos imagenes,stilos framework 
app.use(express.static(path.join(__dirname, "public")));


//iniciar servidor
app.listen(3000,()=>{
    console.log("servidor arriba y funcionando")
})
