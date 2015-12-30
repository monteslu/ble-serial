'use strict';

var VirtualSerialPort = require('../index').SerialPort;

var firmata = require('firmata');

var sp = new VirtualSerialPort();

sp.on('open', function(){

  console.log('serialport ready, type in something to send it...');

  process.stdin.setEncoding('utf8');

  process.stdin.on('readable', function() {
    var chunk = process.stdin.read();
    if (chunk !== null) {
      sp.write(chunk);
    }
  });

  sp.on('data', function(data){
    console.log('data received', data.toString('utf8'));
  });

});




