// este código crea una aplicación web utilizando el framework 'express' en Node.js y almacena la instancia de la aplicación en la variable 'app'.
const express = require('express');
const app = express();

// estas dos líneas de código configuran la aplicación web para poder manejar datos enviados desde formularios HTML y solicitudes AJAX que envían datos en formato JSON.
app.use(express.urlencoded({extended:false}));
app.use(express.json());

// estas líneas de código cargan las variables de entorno definidas en un archivo de configuración '.env' en la aplicación Node.js utilizando el paquete 'dotenv'.
const dotenv = require('dotenv');
dotenv.config({path:'./env/.env'});

// estas líneas de código configuran un middleware en la aplicación Express para servir archivos estáticos alojados en un directorio público en la ruta '/resources', ya sea utilizando una ruta relativa o una ruta absoluta al directorio público.
app.use('/resources', express.static('public'));
app.use('/resources', express.static(__dirname + '/public'));

// esta línea de código configura el motor de plantillas para la aplicación web de Express para que pueda renderizar vistas utilizando el motor de plantillas 'ejs'.
app.set('view engine', 'ejs');

// estas líneas de código agregan el middleware de sesión a la aplicación Express y lo configuran para usar una clave secreta para firmar las cookies de sesión, volver a guardar la sesión en el almacén de sesiones incluso si la sesión no se ha modificado y crear una nueva sesión si no existe una sesión existente.
const session = require('express-session');
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

// esta línea de código carga el módulo 'db.js' que contiene información de conexión a la base de datos MySQL y crea una instancia de la conexión a la base de datos que se utilizará en otras partes de la aplicación.
const connection = require('./database/db');

// esta línea de código establece una ruta para manejar las solicitudes GET a la ruta raíz del sitio web y renderiza la plantilla "index" utilizando el motor de plantillas 'ejs' con datos pasados a ella.
app.get('/', (req, res)=>{
    res.render('index', {msg: ' que bendicion, el inventario de productos varios'});
})

app.get('/login', (req, res)=>{
    res.render('login');
})

app.get('/register', (req, res)=>{
    res.render('register');
})

// Este código define una ruta POST en la aplicación para registrar un producto en la base de datos. Los datos del producto se obtienen del cuerpo de la solicitud HTTP y se asignan a las variables id, nombre, marca y stock.
app.post('/register', async (req, res) => {
    const id = req.body.id;
    const nombre = req.body.nombre;
    const marca = req.body.marca;
    const stock = req.body.stock;

    // Este código inserta datos en la tabla 'productos' de la base de datos utilizando los valores proporcionados en las variables 'id', 'nombre', 'marca' y 'stock'. Si ocurre un error durante la inserción, se muestra un mensaje de error. Si no hay errores, se establece una sesión y se muestra un mensaje de éxito.
    connection.query('INSERT INTO productos SET ?',{id:id, nombre:nombre, marca:marca, stock:stock}, async(error, result)=>{
        if (error) {
            res.render('register',{
                alert:true,
                alertTitle: "Error",
                alertMessage: "Registro incorrecto!",
                alertIcon: "error",
                showConfirmButton: true,
                timer: 1500,
                ruta: 'register'
            });
        }else{
            req.session.loggedin = true;
            req.session.nombre = nombre
            res.render('login', {
                alert: true,
                alertTitle: "Registro creado!",
                alertMessage: "Registro exitoso!",
                alertIcon: "success",
                showConfirmButton: false,
                timer: 1500,
                ruta:'login'
            })
        }
    })
})

// Este es un manejador de rutas POST para '/auth' que obtiene el nombre y la identificación del cuerpo de la solicitud.
app.post('/auth', async (req, res) => {
    const nombre = req.body.nombre;
    const id = req.body.id;

    // Si se han ingresado, se realiza una consulta a la base de datos para verificar si el nombre existe y si el ID coincide. Si no se han ingresado o si no hay coincidencias en la consulta, se muestra un mensaje de error en la pantalla de inicio de sesión. Si se ingresó correctamente, se establece una sesión y se muestra un mensaje de éxito en la pantalla de inicio de sesión.
    if(nombre && id){
        connection.query('SELECT * FROM productos WHERE nombre = ?', [nombre], async (error, results) => {
            if(results.length == 0 || !(id, results[0].id)){
                res.render('login',{
                    alert:true,
                    alertTitle: "Error",
                    alertMessage: "Nombre y/o identificacion incorrecto",
                    alertIcon: "error",
                    showConfirmButton: true,
                    timer: 1500,
                    ruta: 'login'
                });
            }else{
                req.session.loggedin = true;
                req.session.nombre = results[0].nombre
                res.render('login', {
                    alert: true,
                    alertTitle: "Conexión Exitosa",
                    alertMessage: "Inicio de sesion exitoso!",
                    alertIcon: "success",
                    showConfirmButton: false,
                    timer: 1500,
                    ruta:''
                })
            }
        })
    }else{
        res.render('login', {
            alert: true,
            alertTitle: "Advertencia",
            alertMessage: "¡Por favor ingrese un nombre y/o identificacion valida!",
            alertIcon: "warning",
            showConfirmButton: true,
            timer: 1500,
            ruta:'login'
        })
    }
})

app.listen(3000, (req, res) => {
    console.log('Se esta ejecutando aca: http://localhost:3000');
})