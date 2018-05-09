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

var permitirLectura = true;

const connectionString = "postgres://postgres:chichilo@localhost:5433/carreras";

const { URL } = require('url');

const client = new pg.Client(connectionString);
	client.connect();

//var queryNotify = client.query('LISTEN addedrecord');

	//BodyParser y estilos
	app.use(bodyParser.urlencoded({ extended: true }));

	// WebServer Responses
	app.use(express.static(__dirname + '/views'));

	app.get('/', function(req, res){
  		res.sendFile(__dirname + '/views/index.html');
	});

	app.get('/cliente', function(req, res){
	   res.sendFile(__dirname + '/views/cliente.html');
	});

	app.post('/lectura', function(req, res){

		if (!permitirLectura) return;

		//GUARDAR EN BASE DE DATOS Y EMITE QUE HUBO LECTURA
		var codigo = req.body.c;
		var tiempo = req.body.m;
		var inscripcion;
		var corredor;
		var carrera;

		// var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
		// 	if (ip.substr(0, 7) == "::ffff:") {
  // 				ip = ip.substr(7);
		// 	}

		const selectInscripcion = 'SELECT * FROM inscripcion WHERE codigo = 3200000 AND activa = true'
		//const selectValor = [codigo];

		//selectValor
		client.query(selectInscripcion, function(err, result) {
	    	if(err) {
	      		return console.error('error running query', err);
	    	}
	    	else{
		    	result.rows = result.rows.map(row => Object.assign({}, row));
		    	inscripcion = result.rows[0];

		    	client.query('SELECT c.nombre,c.apellido FROM corredor c WHERE c.id = 1',
		    		function(err,result){
		    		if(err) {
		      			return console.error('error running query', err);
		    		}
		    		else{
		    			result.rows = result.rows.map(row => Object.assign({}, row));
		    			corredor = result.rows[0];

			    		client.query('SELECT c.tiempoinicioarduino FROM carrera c where c.id = 1',
			    			function(err,result){
				    		if(err) {
				      			return console.error('error running query', err);
				    		}
				    		else{
					    		result.rows = result.rows.map(row => Object.assign({}, row));
					    		carrera = result.rows[0];

						    	const insertLectura = 'INSERT INTO lectura(idCarrera,idCorredor,tiempoarduino,codigo) VALUES ($1,$2,$3,$4)';
								const insertValorLectura = [inscripcion.idcarrera,inscripcion.idcorredor,tiempo,codigo];

								client.query(insertLectura,insertValorLectura, (err,result)=>{
									if (err) {
						  				console.log(err.stack)
						  			} else {
						   		  		console.log("Lectura confirmada.");
						   		  		io.emit("lectura",[tiempo-carrera.tiempoinicioarduino,corredor.nombre+ " " +corredor.apellido])
										res.sendStatus(200);
						  			}
								});
				    		}
	    				});
		    		}
				});
			}
   }); 


		

	});

	app.post('/carrera', function(req, res){

		var nombre = req.body.nombre;
		var fecha = req.body.fecha;
		var horaInicio = req.body.horaInicio;
		var horaFin = req.body.horaFin;
		var tiempoInicioArduino = req.body.tiempoInicioArduino;
		var tiempoFinArduino = req.body.tiempoFinArduino;
		
		const insertCarrera = 'INSERT INTO carrera(nombre,fecha,horaInicio,horaFin,tiempoInicioArduino,tiempoFinArduino) VALUES ($1,$2,$3,$4,$5,$6)';
		const insertValorCarrera = [nombre,fecha,horaInicio,horaFin,tiempoInicioArduino,tiempoFinArduino];

		client.query(insertCarrera,insertValorCarrera, (err,result)=>{
			if (err) {
    			console.log(err.stack)
  			} else {
    			console.log(result.rows[0])
  			}
		});
	});

	// Socket Responses
	io.on('connection', function(socket){
		console.log('Se conecto un usuario.');
		//ACA SEGUN LA VISTA DEBERIA HACER LAS BUSQUEDAS EN LA BASE DE DATOS.

		// socket.on('listoData', function (data) {
  //       	client.on('notification', function(lectura) {
  //           	socket.emit('lecturas', lectura);
  //       	});
  //       });

		socket.on('cambiarModoLectura',function(msg) {
			permitirLectura = !permitirLectura;
		});

		// COMUNICACION CON EL ARDUINO.
		socket.on('pedirTiempo', function(msg){

			console.log('Ip del arduino: ' + msg);
			let arduinoURL = new URL('http://' + msg + '/millis')

			http.get(arduinoURL, (res) => {
			  console.log("Obtuvo respuesta: " + res.statusCode);
			    res.on('data', function (chunk) {
			    	//Aca hay que emitir segun el caso.
				    console.log('Tiempo del arduino: ' + chunk);
				  });
			}).on('error', function(e) {
			  console.log("Error al enviar " + e.message);
			});

		});

		socket.on('pedirLectura', function(msg){

			console.log('Ip del arduino: ' + msg);
			let arduinoURL = new URL('http://' + msg + '/lectura')

			http.get(arduinoURL, (res) => {
			  console.log("Obtuvo respuesta: " + res.statusCode);
			    res.on('data', function (chunk) {
			    	//Aca hay que emitir segun el caso.
				    console.log('Ultima lectura del arduino: ' + chunk);
				  });
			}).on('error', function(e) {
			  console.log("Error al enviar " + e.message);
			});

		});

		socket.on('modoEnvioDatos', function(msg){

			console.log('Ip del arduino: ' + msg);
			let arduinoURL = new URL('http://' + msg + '/modoenviodato')

			http.get(arduinoURL, (res) => {
			  console.log("Obtuvo respuesta: " + res.statusCode);
			    res.on('data', function (chunk) {
			    	//Aca hay que emitir segun el caso.
				    console.log('Modo envio de datos: ' + chunk);
				  });
			}).on('error', function(e) {
			  console.log("Error al enviar " + e.message);
			});

		});


		// 
		socket.on('pedirLecturas', function(socket){

			const selectLecturas = 'SELECT * lectura WHERE activa = true'

			client.query(selectLecturas, (err,result)=>{
				if (err) {
	    			console.log(err.stack);
	  			} else {
					result.rows = result.rows.map(row => Object.assign({}, row));
					socket.emit('lecturas',result.rows);
	  			}
			});


		});

		socket.on('disconnect', function(socket){
			console.log('Se desconecto un usuario');
		});
		//
		//ACA LA IDEA SERIA QUE CARGE LAS LECTURAS A MEDIDAS QUE SE CARGAN EN LA DB.
		//ESTO ESTA MAL.
		// socket.on('lectura', function(msg){
		// 	io.emit('lectura', msg);
		// });
		socket.on('tiempo', function(msg){
			io.emit('tiempo', msg);
		});
	});

server.listen(ops.port, () => console.log('Servidor iniciado en el puerto ' + ops.port + '.'));