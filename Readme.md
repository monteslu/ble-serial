ble-serial
=============

A virtual [node-serialport](https://github.com/voodootikigod/node-serialport) stream implementation that uses Bluetooth Low Energy as the transport.


# BLESerialPort

Use BLE to send/receive data to a remote physical device:

```js
var BLESerialPort = require('ble-serial').SerialPort;
var firmata = require('firmata');

//create the mqtt serialport and specify the send and receive topics
var serialPort = new BLESerialPort({
  serviceId: '', //OPTIONAL
  transmitCharacteristic: '', //OPTIONAL
  receiveCharacteristic: '' //OPTIONAL
});

//use the virtual serial port to send a command to a firmata device
var board = new firmata.Board(serialPort, function (err, ok) {
  if (err){ throw err; }
  //light up a pin
  board.digitalWrite(13, 1);
});

```

When creating the port, specify a filter in the options to narrow down which BLE device to use. The default behaviour - if the `filter` parameter is not supplied - is to use the first device found.

```js
var serialPort = new BLESerialPort({
  filter:function(peripheral) {
    // Only connects to BLE devices with local name '101'
    return peripheral.advertisement.localName == "101";
  }
});
```
