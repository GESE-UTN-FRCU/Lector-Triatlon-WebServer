var stdio = require('stdio');
var ops = stdio.getopt({
    'port': {key: 'p', args: 1, description: 'Puerto que se va a usar'}
});

var http = require('http');
var express = require('express');
var app = express();
var server = http.createServer(app).listen(ops.port);
var bodyParser = require('body-parser');
var io = require('socket.io')(server);
//var cors = require('cors');

	//BodyParser
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

	app.post('/actions/:filename', function(req, res){
		var tarjeta = req.body.c;
		var tiempo = req.body.m;

		//GUARDAR EN BASE DE DATOS
	});

	app.post('/actions/:filename', function(req, res){
		require('./actions/' + req.params.filename)(this, req, res);
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
		socket.on('chat message', function(msg){
			io.emit('chat message', msg);
		});
	});


server.listen(ops.port, () => console.log('Servidor iniciado en el puerto ' + ops.port + '.'));