
function readlastRFID(){
	var socket = io();
	socket.emit('pedirLectura','192.168.10.152');
	
	socket.on('lecturaPedida', function(res){

		//document.getElementById('codigo').value= res;
		document.getElementById('codigo').value='3000';
		document.getElementById('labelCodigo').className="active";

	});


}

function getTimeArduino(){
		var socket = io();
	    socket.emit('pedirTiempo','192.168.10.152');
}