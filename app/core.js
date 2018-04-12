function Core(options){

	this.options = options;

	this.init = function(){
		this.createServer();
		this.configureServer();
		this.initServer();
	};

	this.createServer = function(){
		this.express = require('express');
		this.app = this.express();
		this.server = require('http').Server(this.app);
		this.io = require('socket.io')(this.server);
		this.bodyParser = require('body-parser');
		//this.cors = require('cors');
	}

	this.configureServer = function(){
		var self = this;
		this.app.use(this.bodyParser.urlencoded({ extended: false }));
		//this.app.use(this.cors);

		// WebServer Responses
		this.app.get('/', function(req, res){self.indexResponse.call(self, req, res)});
		this.app.get('/cliente', function(req, res){self.clientResponse.call(self, req, res)});
		this.app.get('/administrador', function(req, res){self.adminResponse.call(self, req, res)});
		this.app.get('/assets/:filename', function(req, res){self.assetsResponse.call(self, req, res)});
		this.app.options('/actions/:filename', function(req, res){self.sendOptions.call(self, req, res)}); //esto deberia ser POST (para leer tarjetas y esas cosas)
		this.app.post('/actions/:filename', function(req, res){self.executeAction.call(self, req, res)}); //esto deberia ser POST (para leer tarjetas y esas cosas)

		// WebSocket Responses
		this.io.on('connection', function(socket){self.onConnect.call(self, socket)});
	};

	this.initServer = function(){
		var self = this;
		this.server.listen(this.options.port, function(){
			self.onServerStart.call(self)
		});
	};

	this.onServerStart = function(){
		console.log('Servidor iniciado en el puerto ' + this.options.port + '.');
	};

	this.configureSocket = function(socket){
		var self = this;
		socket.on('disconnect', function(socket){self.onDisconnect.call(self, socket)});
		socket.on('chat message', function(msg){
			self.io.emit('chat message', msg);
		});
	};

	this.onConnect = function(socket){
		console.log('Se conecto un usuario. Ahora hay ' + this.numberOfConnections() + ' usuarios conectados.');
		this.configureSocket(socket);
	};

	this.onDisconnect = function(socket){
		console.log('Se desconecto un usuario. Ahora hay ' + this.numberOfConnections() + ' usuarios conectados.');
	};

	this.indexResponse = function(req, res){
		res.sendFile(__dirname + '/views/index.html');
	};

	this.adminResponse = function(req, res){
		res.sendFile(__dirname + '/views/administrador.html');
	};

	this.clientResponse = function(req, res){
		res.sendFile(__dirname + '/views/cliente.html');
	};

	this.assetsResponse = function(req, res){
		res.sendFile(__dirname + '/views/');
	};

	this.sendOptions = function(req, res){
		res.header("Access-Control-Allow-Origin", "*");
		res.header("Access-Control-Allow-Headers", "Content-Type,Accept");
		res.send("OK");
	}

	this.executeAction = function(req, res){
		require('./actions/' + req.params.filename)(this, req, res);
	}

	this.getConnectedUsers = function(){
		return this.io.sockets.connected;
	};

	this.numberOfConnections = function(){
		return Object.keys(this.getConnectedUsers()).length;
	};

};

module.exports = function(options){
	return new Core(options);
};