module.exports = function(core, req, res){
	core.io.emit('chat message', 'Comenzo una nueva carrera...');
	res.send('EXITO!');
};