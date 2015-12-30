'use strict';

var VirtualSerialPort = require('../index').SerialPort;

var firmata = require('firmata');

var sp = new VirtualSerialPort();

var board = new firmata.Board(sp);
board.on('ready', function(){
  console.log('actually connected to an arduino!');
  board.digitalWrite(13, 1);
});
