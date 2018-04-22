//PARAMETROS DE LA FUNCION NODE
var stdio = require('stdio');
var ops = stdio.getopt({
    'port': {key: 'p', args: 1, description: 'Puerto que se va a usar'}
});

//NODE-MODULES
//Web
var http = require('http');
var express = require('express');
var app = express();
var server = http.createServer(app).listen(ops.port);
var bodyParser = require('body-parser');

//Sockets
var io = require('socket.io')(server);

//Base de datos
var pg = require('pg');
const connectionString = "tcp://postgres:chichilo@localhost/my_db";

const client = new pg.Client(connectionString);
	

	client.connect();

	//BodyParser y estilos
	app.use(bodyParser.urlencoded({ extended: true }));
	//app.use(cors);

	// WebServer Responses
	app.use(express.static(__dirname + '/app'));

	app.get('/', function(req, res){
  		res.sendFile(__dirname + '/views/index.html');
	});

	app.get('/cliente', function(req, res){
	   res.sendFile(__dirname + '/views/cliente.html');
	});
	
	app.get('/administrador', function(req, res){
	   res.sendFile(__dirname + '/views/cliente.html');
	});

	app.post('/tiempo', function(req, res){
		var tiempo = req.body.m;

		//GUARDAR EN BASE DE DATOS Y EMITE QUE HUBO LECTURA
		io.emit('tiempo','Tiempo del dispositivo en millis():' + req.body.m);

	});

	app.post('/lectura', function(req, res){
		var tarjeta = req.body.c;
		var tiempo = req.body.m;

		//GUARDAR EN BASE DE DATOS Y EMITE QUE HUBO LECTURA
		io.emit('lectura','Se paso una tarjeta con el codigo: ' + req.body.c + ' y los millis():' + req.body.m);

	});

	app.post('/actions/:filename', function(req, res){
		//require('./actions/' + req.params.filename)(req, res);
	});
	
	app.options('/actions/:filename', function(req, res){
		res.header("Access-Control-Allow-Origin", "*");
		res.header("Access-Control-Allow-Headers", "Content-Type,Accept");
		res.send("OK");
	});

	// Socket Responses
	io.on('connection', function(socket){
		console.log('Se conecto un usuario.');

		socket.on('disconnect', function(socket){
			console.log('Se desconecto un usuario');
		});
		//
		//ACA LA IDEA SERIA QUE CARGE LAS LECTURAS A MEDIDAS QUE SE CARGAN EN LA DB
		socket.on('lectura', function(msg){
			io.emit('lectura', msg);
		});
		socket.on('tiempo', function(msg){
			io.emit('tiempo', msg);
		});
	});


server.listen(ops.port, () => console.log('Servidor iniciado en el puerto ' + ops.port + '.'));