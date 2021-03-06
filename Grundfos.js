//      Main Program for Motor Control
//      by Frank Hsiung         Aug 21, 2015

// Loading modules {
var http = require('http');
var fs = require('fs');
var b = require('bonescript');
// }----------------------------------------------------------------------------
// set Pins {
var RelayPin = 'P9_12';                 // default Relay Pin
b.pinMode('USR0', b.OUTPUT);            // USR0, USR1 are on/off the same as Relay
b.pinMode('USR1', b.OUTPUT);
b.pinMode('USR2', b.OUTPUT);            // USR2 alive toggle with USR3
b.pinMode('USR3', b.OUTPUT);
b.pinMode(RelayPin, b.OUTPUT);          // Relay Pin for Turn ON/OFF Motor
b.digitalWrite(RelayPin, 0);            // turn off motor
b.digitalWrite('USR0', 0);              // turns the LED OFF
b.digitalWrite('USR1', 0);
b.digitalWrite('USR2', 0);
// }----------------------------------------------------------------------------
// Global Variables and Constants {
var downCounter = 0;                    // Main Counter of Motor ON
var logCounter = 0;                     // for turn on log
var intervalObject;                     // Returns a timeoutObject for possible use with clearTimeout()
// }----------------------------------------------------------------------------
// State Machine Initialization {
setTimeout(stateCheckCounter, 1000);    // Initialization for Main State
setTimeout(aliveSignal0, 500);          // Initialization for Toggling LED
// }----------------------------------------------------------------------------
// Initialize the server on port 8168 {
var server = http.createServer(function (req, res) {
    var file = '/var/lib/cloud9/BeagleBone_Motor'+((req.url=='/')?'/Grundfos.html':req.url); // requesting files
    var contentType = 'text/html';
            // Uncoment if you want to add css to your web page
            // var path = require('path');
            // var fileExtension = path.extname(file);
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
}).listen(8168,'192.168.0.168');
// }----------------------------------------------------------------------------
// socket.io Communication {
var io = require('socket.io').listen(server); // Loading socket io module

io.on('connection', function (socket) { // When communication is established
    socket.on('pumpON', function(data) {// Clent-size signal for reset downCounter to shower.value
        var shower = JSON.parse(data);
        if (shower.on == 1) {
            downCounter = shower.value; // set or reset downCounter to shower.value
            logCounter++;
            console.log(new Date +': Grundfos '+ logCounter +'th turn-on for '+ shower.value +' seconds'); 
            if (1 == logCounter%2) {    // Two LED for Key Press Toggle
                b.digitalWrite('USR1', 1);
                b.digitalWrite('USR2', 0);
            } else {
                b.digitalWrite('USR1', 0);
                b.digitalWrite('USR2', 1);
            }
        } else if (shower.on == 0) downCounter = 1;
        
    }); // pumpON string from Grundfos.html; shower.on turn on Motor
});

// server.listen(console.log('Grundfos Server is Running: http://' + getIPAddress() + ':8168'));
// }----------------------------------------------------------------------------
// State Machine and Function Call {
function stateCheckCounter() {
    if (downCounter > 1) {              // 5~20 minutes
        b.digitalWrite(RelayPin, 1);    // turn on motor
        b.digitalWrite('USR0', 1);      // turns the LED ON
        intervalObject = setInterval(function() { // broadcast.emit: server to "n clients"
            downCounter--;
            io.sockets.emit("downCounter", '{"downValue":"'+ downCounter +'"}');
        }, 999); // one second interval count down; pass downCounter value to client
        setTimeout(stateDownCounting, 1); // state change
    } else {
        setTimeout(stateCheckCounter, 1000); // 
    }
}

function stateDownCounting() {
    if (downCounter > 0) {
        setTimeout(stateDownCounting, 999);
    } else {
        b.digitalWrite(RelayPin, 0);    // turn off motor
        b.digitalWrite('USR0', 0);      // turns the LED OFF
        b.digitalWrite('USR1', 0);
        b.digitalWrite('USR2', 0);
        // console.log('\t\tGrundfos Hot Water Pump is the '+ logCounter +'th turn-off'); 
        clearInterval(intervalObject);
        setTimeout(stateCheckCounter, 1);// state change
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

function getIPAddress() {               // Get server IP address on LAN
  var interfaces = require('os').networkInterfaces();
  for (var devName in interfaces) {
    var iface = interfaces[devName];
    for (var i = 0; i < iface.length; i++) {
      var alias = iface[i];
      if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal)
        return alias.address;
    }
  }
  return '0.0.0.0';
}
// }