var stdio = require('stdio');
var ops = stdio.getopt({
    'port': {key: 'p', args: 1, description: 'Puerto que se va a usar'}
});

require('./app/core.js')({
	"port" : ops.port||3000
}).init();