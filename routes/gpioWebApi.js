const express = require('express');
const router = express.Router();
const wpi = require('wiring-op');
wpi.setup('wpi');

/* GET home page. */
router.get('/', function(req, res, next) {
  let json = [];
  const devices = require('../device_list.json');
  devices.forEach(row => {
    json.push({
          'pin': row.pin,
          'status': (+!wpi.digitalRead(row.pin))
    });
  });
  res.json(json);
});

router.get('/status/:id', function(req, res, next) {
  res.json({'pin': req.params.id, 'status': (+!wpi.digitalRead(parseInt(req.params.id))) });
});

router.get('/on/:id', function(req, res, next) {
  const pin = parseInt(req.params.id);
  wpi.pinMode(pin, wpi.OUTPUT);
  wpi.digitalWrite(pin, 0);
  res.json({'pin': pin, 'status': 1});
});

router.get('/off', function(req, res, next) {
  for (var i = 1; i < 4; i++) {
    wpi.pinMode(i, wpi.OUTPUT);
    wpi.digitalWrite(i, 1);
  }
  res.json({'msg': 'all pins off'});
});

router.get('/off/:id', function(req, res, next) {
  const pin = parseInt(req.params.id);
  wpi.pinMode(pin, wpi.OUTPUT);
  wpi.digitalWrite(pin, 1);
  res.json({'pin': pin, 'status': 0});
});

module.exports = router;
