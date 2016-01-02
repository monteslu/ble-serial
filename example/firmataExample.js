/*
 * To run with logging run as:
 * DEBUG=ble-serial node firmataExample
 */
var BLESerialPort = require('../index').SerialPort;
var Firmata = require('firmata').Board;

//use the virtual serial port to send a command to a firmata device
var board = new Firmata(new BLESerialPort({
  // serviceId: '', //OPTIONAL
  // transmitCharacteristic: '', //OPTIONAL
  // receiveCharacteristic: '' //OPTIONAL
}));

board.on("ready", function() {
  console.log("READY!");
  console.log(
    board.firmware.name + "-" +
    board.firmware.version.major + "." +
    board.firmware.version.minor
  );

  var state = 1;
  var blinkPin = 13;

  setInterval(function() {
    board.digitalWrite(blinkPin, (state ^= 1));
  }, 500);

});
