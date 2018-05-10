
function readlastRFID(){
	var socket = io();
	socket.emit('pedirLectura','192.168.10.152');
	
	socket.on('lecturaPedida', function(res){
		document.getElementById('codigo').value= res;
		document.getElementById('labelCodigo').className="active";
	});


}

function initCarrera(){
		var socket = io();
	    socket.emit('actualizarCarrera',['192.168.10.152','iniciar']);
}

function endCarrera(){
		var socket = io();
	    socket.emit('actualizarCarrera',['192.168.10.152','fin']);
}