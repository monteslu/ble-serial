'use strict';

var util = require('util');
var stream = require('stream');
var noble = require('noble');
var debug = require('debug')('ble-serial');


var DEFAULT_SERIAL_SERVICE = '6e400001b5a3f393e0a9e50e24dcca9e';
var DEFAULT_TRANSMIT_CHARACTERISTIC = '6e400002b5a3f393e0a9e50e24dcca9e';
var DEFAULT_RECEIVE_CHARACTERISTIC = '6e400003b5a3f393e0a9e50e24dcca9e';

function compareUUIDs(a, b){
  a = a || '';
  b = b || '';
  a = a.toLowerCase().replace(/\-/g, '');
  b = b.toLowerCase().replace(/\-/g, '');
  return a === b;
 }

function BLESerialPort(options) {

  options = options || {};
  this.receiveCharacteristic = options.receiveCharacteristic || DEFAULT_RECEIVE_CHARACTERISTIC;
  this.transmitCharacteristic = options.transmitCharacteristic || DEFAULT_TRANSMIT_CHARACTERISTIC;
  this.serviceId = options.serviceId || DEFAULT_SERIAL_SERVICE;
  this.peripheral = options.peripheral;

  this.buffer = null;
  this.lastCheck = 0;
  this.lastSend = 0;

  var self = this;

  if(!this.peripheral){
    
   
    if(noble.state === 'poweredOn'){
      noble.startScanning([self.serviceId], false);
    }else{
      noble.on('stateChange', function(state) {
        if (state === 'poweredOn'){
          noble.startScanning([self.serviceId], false);
        }else{
          noble.stopScanning();
        }
      });
    }
   


    noble.on('discover', function(peripheral) {
    // we found a peripheral, stop scanning
      noble.stopScanning();

      self.peripheral = peripheral;
      //
      // The advertisment data contains a name, power level (if available),
      // certain advertised service uuids, as well as manufacturer data,
      // which could be formatted as an iBeacon.
      //
      debug('found peripheral:', self.peripheral.advertisement);

      //
      // Once the peripheral has been discovered, then connect to it.
      // It can also be constructed if the uuid is already known.
      ///
      self.peripheral.connect(function(err) {

        debug('connected', err);

        //
        // Once the peripheral has been connected, then discover the
        // services and characteristics of interest.
        //
        self.peripheral.discoverServices([], function(err, services) {
          debug('discoverServices', err, services);
          services.forEach(function(service) {
            debug('found service', service);


            //
            // So, discover its characteristics.
            //
            service.discoverCharacteristics([], function(err, characteristics) {

              debug('found characteristics', err, characteristics);
              characteristics.forEach(function(characteristic) {
                //
                // Loop through each characteristic and match them to the
                // UUIDs that we know about.
                //
                debug('found characteristic:', characteristic.uuid);

                if (compareUUIDs(self.transmitCharacteristic, characteristic.uuid)){
                  self.transmit = characteristic;
                }
                else if (compareUUIDs(self.receiveCharacteristic, characteristic.uuid)) {
                  self.receive = characteristic;
                }
              });

              //
              // Check to see if we found all of our characteristics.
              //
              if (self.transmit && self.receive){
                debug('have both characteristics', self.transmit, self.receive);
                self.emit('open');



                self.receive.on('read', function(data, isNotification) {
                  debug('read', data, isNotification);
                  self.emit('data', data);
                });
                self.receive.notify(true, function(err) {
                  debug('notify', err);
                });


              }
              else {
                debug('missing characteristics');
              }
            });



          });
        });

      });

    });


  }
  else{
    //TODO do rx/tx stuff on the passed in peripheral
  }

}

util.inherits(BLESerialPort, stream.Stream);


BLESerialPort.prototype.open = function (callback) {
  this.emit('open');
  if (callback) {
    callback();
  }

};



BLESerialPort.prototype.write = function (data, callback) {

  debug('writing', data);

  if (!Buffer.isBuffer(data)) {
    data = new Buffer(data);
  }

  if(this.transmit){
    this.transmit.write(data, false);
  }

};



BLESerialPort.prototype.close = function (callback) {
  debug('closing');
  if(this.peripheral){
    this.peripheral.disconnect();
  }
  if(callback){
    callback();
  }
};

BLESerialPort.prototype.flush = function (callback) {
  debug('flush');
  if(callback){
    callback();
  }
};

BLESerialPort.prototype.drain = function (callback) {
  debug('drain');
  if(callback){
    callback();
  }
};



module.exports = {
  SerialPort: BLESerialPort
};
