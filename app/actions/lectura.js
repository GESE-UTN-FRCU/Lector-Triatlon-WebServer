module.exports = function(core, req, res){
	console.log(req.body);
	core.io.emit('chat message', 'Se paso una tarjeta con el codigo: ' + req.body.c + ' y los millis():' + req.body.m);
	res.send('EXITO!');
};