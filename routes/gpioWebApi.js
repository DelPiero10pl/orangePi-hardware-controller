var express = require('express');
var router = express.Router();
var wpi = require('wiring-pi');
wpi.setup('wpi');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: '1:'+(+!wpi.digitalRead(1))+' 2:'+(+!wpi.digitalRead(2))+' 3:'+(+!wpi.digitalRead(3)) });
});

router.get('/status/:id', function(req, res, next) {
  res.render('index', { title: 'Status by id' });
});

router.get('/on/:id', function(req, res, next) {
  res.render('index', { title: 'On led by id' });
});

router.get('/off', function(req, res, next) {
  res.render('index', { title: 'Off all' });
});

router.get('/off/:id', function(req, res, next) {
  res.render('index', { title: 'Off led by id' });
});

module.exports = router;
