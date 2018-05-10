
var socket = io();

function readlastRFID(){
	socket.emit('pedirLectura','192.168.10.152');
	
	socket.on('lecturaPedida', function(res){
		document.getElementById('codigo').value= res;
		document.getElementById('labelCodigo').className="active";
	});


}

function initCarrera(){
	    socket.emit('actualizarCarrera',['192.168.10.152','iniciar']);
}

function endCarrera(){
	    socket.emit('actualizarCarrera',['192.168.10.152','fin']);
}