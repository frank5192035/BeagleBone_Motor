//      Main Program for Motor Control
//      by Frank Hsiung
// Loading modules
var http = require('http');
var fs = require('fs');
var path = require('path');
var b = require('bonescript');
var RelayPin = "P9_12";                 // default Relay Pin

b.pinMode('USR0', b.OUTPUT);            // USR0, USR1 are on/off the same as Relay
b.pinMode('USR1', b.OUTPUT);
b.pinMode('USR2', b.OUTPUT);            // USR2 alive toggle with USR3
b.pinMode('USR3', b.OUTPUT);
b.pinMode(RelayPin, b.OUTPUT);          // Relay Pin for Turn ON/OFF Motor

setTimeout(aliveSignal0, 500);          // Initialization for Toggling LED

// -----------------------------------------------------------------------------
// Initialize the server on port 8888
var server = http.createServer(function (req, res) {
    // requesting files
    var file = '.'+((req.url=='/')?'/index.html':req.url);
    var fileExtension = path.extname(file);
    var contentType = 'text/html';
    // Uncoment if you want to add css to your web page
    // if(fileExtension == '.css') {
    //     contentType = 'text/css';
    // }
    fs.exists(file, function(exists) {
        if(exists){
            fs.readFile(file, function(error, content) {
                if(!error) {
                    res.writeHead(200,{'content-type':contentType}); // Page found, write content
                    res.end(content);
                }
            })
        }
        else {
            res.writeHead(404);         // Page not found
            res.end('Page not found');
        }
    })
}).listen(8888);
// -----------------------------------------------------------------------------
var io = require('socket.io').listen(server); // Loading socket io module

io.on('connection', function (socket) { // When communication is established
    socket.on('changeState', handleChangeState);
});

server.listen(console.log("Server Running ..."));
// -----------------------------------------------------------------------------
// Function Call {
function handleChangeState(data) { // Change led state when a button is pressed
    var pinOut = JSON.parse(data);
    console.log("LED = " + pinOut.state);
    
    b.digitalWrite(RelayPin, pinOut.state);
    b.digitalWrite('USR0', pinOut.state); // turns the LED ON or OFF
    b.digitalWrite('USR1', pinOut.state);
}

function aliveSignal0() {
    b.digitalWrite('USR2', b.LOW);
    b.digitalWrite('USR3', b.HIGH);
    setTimeout(aliveSignal1, 500);      // Toggle LED
}

function aliveSignal1() {
    b.digitalWrite('USR2', b.HIGH);
    b.digitalWrite('USR3', b.LOW);
    setTimeout(aliveSignal0, 500);      // Toggle LED
}
// }



