//Loading modules
var http = require('http');
var fs = require('fs');
var path = require('path');
var b = require('bonescript');

b.pinMode('USR0', b.OUTPUT);            // on/off the same as Relay
b.pinMode('USR1', b.OUTPUT);            // on/off the same as Relay
b.pinMode('USR2', b.OUTPUT);            // alive toggle with USR3
b.pinMode('USR3', b.OUTPUT);
// b.digitalWrite('USR0', b.HIGH);

var outputPin = "P9_12";

b.pinMode(outputPin, b.OUTPUT);
b.digitalWrite(outputPin, b.LOW);
// b.digitalWrite(outputPin, b.HIGH);


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
    fs.exists(file, function(exists){
        if(exists){
            fs.readFile(file, function(error, content){
                if(!error){
                    res.writeHead(200,{'content-type':contentType}); // Page found, write content
                    res.end(content);
                }
            })
        }
        else{
            res.writeHead(404);         // Page not found
            res.end('Page not found');
        }
    })
}).listen(8888);

// Loading socket io module
var io = require('socket.io').listen(server);

// When communication is established
io.on('connection', function (socket) {
    socket.on('changeState', handleChangeState);
});

// Change led state when a button is pressed
function handleChangeState(data) {
    var newData = JSON.parse(data);
    console.log("LED = " + newData.state);
    // turns the LED ON or OFF
    b.digitalWrite('USR0', newData.state);
    b.digitalWrite('USR1', newData.state);
    b.digitalWrite('USR2', newData.state);
    b.digitalWrite('USR3', newData.state);
}

// Displaying a console message for user feedback
server.listen(console.log("Server Running ..."));
