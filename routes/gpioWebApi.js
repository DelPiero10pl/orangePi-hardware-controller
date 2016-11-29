var express = require('express');
var router = express.Router();
var wpi = require('wiring-op');
wpi.setup('wpi');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: '1:'+(+!wpi.digitalRead(1))+' 2:'+(+!wpi.digitalRead(2))+' 3:'+(+!wpi.digitalRead(3)) });
});

router.get('/status/:id', function(req, res, next) {
  res.render('index', { title: req.params.id+':'+(+!wpi.digitalRead(parseInt(req.params.id))) });
});

router.get('/on/:id', function(req, res, next) {
  const pin = parseInt(req.params.id);
  wpi.pinMode(pin, wpi.OUTPUT);
  wpi.digitalWrite(pin, 0);
  res.render('index', { title: 'On led: '+pin });
});

router.get('/off', function(req, res, next) {
  for (var i = 1; i < 4; i++) {
    wpi.pinMode(i, wpi.OUTPUT);
    wpi.digitalWrite(i, 1);
  }
  res.render('index', { title: 'Off all' });
});

router.get('/off/:id', function(req, res, next) {
  const pin = parseInt(req.params.id);
  wpi.pinMode(pin, wpi.OUTPUT);
  wpi.digitalWrite(pin, 1);
  res.render('index', { title: 'Off led: '+pin });
});

module.exports = router;
