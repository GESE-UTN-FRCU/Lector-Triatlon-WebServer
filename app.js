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
const connectionString = "postgres://postgres:chichilo@localhost:5433/carreras";

const client = new pg.Client(connectionString);
	client.connect();

	//BodyParser y estilos
	app.use(bodyParser.urlencoded({ extended: true }));

	// WebServer Responses
	app.use(express.static(__dirname + '/app'));

	app.get('/', function(req, res){
  		res.sendFile(__dirname + '/views/index.html');
	});

	app.get('/cliente', function(req, res){
	   res.sendFile(__dirname + '/views/cliente.html');
	});
	
	app.get('/administrador', function(req, res){
	   res.sendFile(__dirname + '/views/administrador.html');
	});

	app.post('/lectura', function(req, res){
		//GUARDAR EN BASE DE DATOS Y EMITE QUE HUBO LECTURA
		var tarjeta = req.body.c;
		var tiempo = req.body.m;
		var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
			if (ip.substr(0, 7) == "::ffff:") {
  				ip = ip.substr(7);
			}
		
		const insertTiempo = 'INSERT INTO lectura(ip_lector,tiempo_lector,tarjeta_corredor) VALUES ($1,$2,$3)';
		const insertValorTiempo = [ip,tiempo,tarjeta];

		client.query(insertTiempo,insertValorTiempo, (err,res)=>{
			if (err) {
    			console.log(err.stack)
  			} else {
    		console.log(res.rows[0])
  			}
		});

		io.emit('lectura','Se paso una tarjeta con el codigo: ' + tarjeta + ' y los millis():' + tiempo);

	});

	// Socket Responses
	io.on('connection', function(socket){
		console.log('Se conecto un usuario.');
		//ACA SEGUN LA VISTA DEBERIA HACER LAS BUSQUEDAS EN LA BASE DE DATOS.

		socket.on('pedirTiempo', function(msg){
			sendTimeRequest(msg);
		});

		socket.on('pedirCarreras', function(socket){

		});

		socket.on('disconnect', function(socket){
			console.log('Se desconecto un usuario');
		});
		//
		//ACA LA IDEA SERIA QUE CARGE LAS LECTURAS A MEDIDAS QUE SE CARGAN EN LA DB.
		//ESTO ESTA MAL.
		socket.on('lectura', function(msg){
			io.emit('lectura', msg);
		});
		socket.on('tiempo', function(msg){
			io.emit('tiempo', msg);
		});
	});



function sendTimeRequest(ip){
	http.get({
		hostname: ip,
		port: 80,
		path: '/tiempo',
		agent: false,
		method: 'GET'
	},function(res){
		res.setEncoding("utf8");
		let body = '';
		res.on("data", data => {
			body += data;
		});

		res.on("end",()=>{

		});
	});
}

server.listen(ops.port, () => console.log('Servidor iniciado en el puerto ' + ops.port + '.'));