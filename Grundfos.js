//      Main Program for Motor Control
//      by Frank Hsiung

// Loading modules {
var http = require('http');
var fs = require('fs');
var path = require('path');
var b = require('bonescript');
// }----------------------------------------------------------------------------
// set Pins {
var RelayPin = "P9_12";                 // default Relay Pin
b.pinMode('USR0', b.OUTPUT);            // USR0, USR1 are on/off the same as Relay
b.pinMode('USR1', b.OUTPUT);
b.pinMode('USR2', b.OUTPUT);            // USR2 alive toggle with USR3
b.pinMode('USR3', b.OUTPUT);
b.pinMode(RelayPin, b.OUTPUT);          // Relay Pin for Turn ON/OFF Motor
// }----------------------------------------------------------------------------
// Global Variables and Constants {
const ShowerTime = 1200;                // 20 Minutes = 1200 Seconds
var downCounter = 0
var intervalObject;                     // Returns a timeoutObject for possible use with clearTimeout()
// }----------------------------------------------------------------------------
// Initialization {
setTimeout(aliveSignal0, 500);          // Initialization for Toggling LED

// }----------------------------------------------------------------------------
// Initialize the server on port 8888 {
var server = http.createServer(function (req, res) {
    // requesting files
    var file = '.'+((req.url=='/')?'/Grundfos.html':req.url);
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
// }----------------------------------------------------------------------------
// socket.io Communication {
var io = require('socket.io').listen(server); // Loading socket io module

io.on('connection', function (socket) { // When communication is established
    socket.on('changeState', showerON);
});

server.listen(console.log("Server Running ..."));
// }----------------------------------------------------------------------------
// State Machine and Function Call {
function showerON(data) { // Clent-size signal for reset downCounter to ShowerTime
    var shower = JSON.parse(data);
    if (shower.on == 1) {
        var downCounter = ShowerTime;   // set downCounter to ShowerTime
        console.log("Grundfos Hot Water Pump is ON... ");
    }
}

function countDown() {                  // downcounting and pass downCounter value to client
    downCounter--;
}

function stateCheckCounter() {
    if (downCounter > 180) {            // at least 3 minutes
        b.digitalWrite(RelayPin, 1);    // turn on motor
        b.digitalWrite('USR0', 1);      // turns the LED ON
        intervalObject = setInterval(countDown, 999); // one second interval count down
        setTimout(stateDownCounting, 1);// state change
    }
    b.digitalWrite('USR1', 1);
    b.digitalWrite('USR2', 0);
}

function stateDownCounting() {
    if (downCounter > 0) {
    } else {
        clearInterval(intervalObject);
    }
}

function aliveSignal0() {               // Two States only
    b.digitalWrite('USR3', 0);
    setTimeout(aliveSignal1, 800);      // Toggle LED
}

function aliveSignal1() {
    b.digitalWrite('USR3', 1);
    setTimeout(aliveSignal0, 200);      // Toggle LED
}
// }