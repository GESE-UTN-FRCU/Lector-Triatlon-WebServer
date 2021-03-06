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
var { Client } = require('pg');

var permitirLectura = true;

const connectionString = "postgres://postgres:chichilo@localhost:5433/carreras";

const { URL } = require('url');

const client = new Client(connectionString);
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

		const selectInscripcion = 'SELECT * FROM inscripcion WHERE codigo = $1 AND activa = true'
		const selectValor = [codigo];

		//selectValor
		client.query(selectInscripcion,selectValor, function(err, result) {
	    	if(err) {
	      		return console.error('error running query', err);
	    	}
	    	else{
		    	result.rows = result.rows.map(row => Object.assign({}, row));
		    	inscripcion = result.rows[0];

		    	if (inscripcion == undefined) {
		    		console.log("Tarjeta no registrada.")
		    		return;
		    	}

		    	const selectCorredor = 'SELECT c.nombre,c.apellido FROM corredor c WHERE c.id = $1';
		    	const selectValorCorredor = [inscripcion.idcorredor];

		    	client.query(selectCorredor,selectValorCorredor,
		    		function(err,result){
		    		if(err) {
		      			return console.error('error running query', err);
		    		}
		    		else{
		    			result.rows = result.rows.map(row => Object.assign({}, row));
		    			corredor = result.rows[0];

			    		client.query('SELECT c.tiempoinicioarduino FROM carrera c where c.id = 22',
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

	app.post('/agregarcarrera', function(req, res){

		var nombre = req.body.nombre;
		var fecha = req.body.fecha;
		var horaInicio = 0;
		var horaFin = 0;
		var tiempoInicioArduino = 0;
		var tiempoFinArduino = 0;
		
		const insertCarrera = 'INSERT INTO carrera(nombre,fecha,horaInicio,horaFin,tiempoInicioArduino,tiempoFinArduino) VALUES ($1,$2,$3,$4,$5,$6)';
		const insertValorCarrera = [nombre,fecha,horaInicio,horaFin,tiempoInicioArduino,tiempoFinArduino];

		client.query(insertCarrera,insertValorCarrera, (err,result)=>{
			if (err) {
    			console.log(err.stack)
  			} else {
  				console.log("Agregando carrera.");
  				res.sendStatus(200);
  			}
		});
	});

	app.post('/agregarcorredor', function(req, res){

		var nombre = req.body.nombre;
		var apellido = req.body.apellido;
		var fechanacimiento = req.body.fechanacimiento;
		var dni = req.body.dni;

		const insertCorredor = 'INSERT INTO corredor(nombre,apellido,dni,fechanacimiento) VALUES ($1,$2,$3,$4)';
		const insertValorCorredor = [nombre,apellido,dni,fechanacimiento];

		client.query(insertCorredor,insertValorCorredor, (err,result)=>{
			if (err) {
    			console.log(err.stack)
  			} else {
  				console.log("Agregando corredor.");
  				res.sendStatus(200);
  			}
		});
	});

	app.post('/agregarinscripcion', function(req, res){

		var idcorredor = req.body.idcorredor;
		//var idcarrera = req.body.idcarrera;
		//var idcategoria = req.body.idcategoria;
		var idcarrera = 22;
		var idcategoria = 1;
		var codigo = req.body.codigo;
		var activa = true;

		const insertInscripcion = 'INSERT INTO inscripcion(idcorredor,idcarrera,codigo,activa,idcategoria) VALUES ($1,$2,$3,$4,$5)';
		const insertValorInscripcion = [idcorredor,idcarrera,codigo,activa,idcategoria];

		client.query(insertInscripcion,insertValorInscripcion, (err,result)=>{
			if (err) {
    			console.log(err.stack)
  			} else {
  				console.log("Agregando inscripcion.");
  				res.sendStatus(200);
  			}
		});
	});


	// Socket Responses
	io.on('connection', function(socket){
		console.log('Se conecto un usuario.');

  		socket.emit('conectado',function(msg){
  		});

		socket.on('cambiarModoLectura',function(msg) {
			permitirLectura = !permitirLectura;
		});

		// COMUNICACION CON EL ARDUINO.
		socket.on('actualizarCarrera', function(msg){

			console.log('Ip del arduino: ' + msg[0]);
			let arduinoURL = new URL('http://' + msg[0] + '/millis')

			http.get(arduinoURL, (res) => {
			  console.log("Obtuvo respuesta: " + res.statusCode);
			    res.on('data', function (chunk) {
			    	//Aca hay que actualizar la carrera en la base de datos.
				    console.log('Tiempo del arduino: ' + chunk);
				    var updateCarrera;
					    if (msg[1] == 'iniciar') {
					    	updateCarrera = 'UPDATE carrera SET tiempoinicioarduino = $1 WHERE id = 22';
					    }
					    else{
					    	updateCarrera = 'UPDATE carrera SET tiempofinarduino = $1 WHERE id = 22';
					    }
						
						const updateValorCarrera = [''+chunk];

						client.query(updateCarrera,updateValorCarrera, (err,result)=>{
							if (err) {
					    		console.log(err.stack)
					  		} else {
					  			console.log("Actualizando carrera.");
					  		}
						});
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
				    io.emit('lecturaPedida','' + chunk);
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


		// Comunicacion con la DB

		socket.on('pedirCorredores', function(socket){
			const selectCorredores = 'SELECT * FROM corredor';

			client.query(selectCorredores,(err,result)=>{
				result.rows = result.rows.map(row => Object.assign({}, row));
				corredores = result.rows;
				io.emit('corredores',corredores);

			});
		});


		socket.on('pedirLecturas', function(socket){
			var tiempocarrera;
			var corredor;
			var lecturas;

			const selectLecturas = 'SELECT * FROM lectura l WHERE l.idcarrera = 22';

			client.query(selectLecturas, (err,result)=>{
				if (err) {
	    			console.log(err.stack);
	  			} else {
					result.rows = result.rows.map(row => Object.assign({}, row));
					lecturas = result.rows;

					const selectTiempoCarrera  = 'SELECT c.tiempoinicioarduino FROM carrera c WHERE c.id = 22';

					client.query(selectTiempoCarrera, (err,result)=>{
						if (err) {
	    					console.log(err.stack);
	  					} else {
	  						result.rows = result.rows.map(row => Object.assign({}, row));
							carrera = result.rows[0];
							var j = 0;
							for (var i = 0; i < lecturas.length-1; i++) {
								(async ()=>{
									try{
										const selectCorredor = 'SELECT c.nombre,c.apellido FROM corredor c WHERE c.id = $1';
										var corredorValue = [lecturas[i].idcorredor];

										var result = await client.query(selectCorredor,corredorValue);
										result.rows = result.rows.map(row => Object.assign({}, row));
										corredor = result.rows[0];
										j++;

									} finally {
										io.emit('lectura',[lecturas[j].tiempoarduino - carrera.tiempoinicioarduino,corredor.nombre+ " " +corredor.apellido]);
									}
								})().catch(e => console.error(e.message,e.stack));		
	  					};
	  				};
	  			});
			}
		});
	});

		socket.on('disconnect', function(socket){
			console.log('Se desconecto un usuario');
		});
	});
server.listen(ops.port, () => console.log('Servidor iniciado en el puerto ' + ops.port + '.'));