const express = require('express')
const logger = require('morgan')
const path = require('path')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const wpi = require('wiring-op')
const mongoose   = require('mongoose')
const fs = require('fs')
var passport = require('passport');
const app = express()
var server = app.listen(80, function () {
  console.log('Example app listening on port 80!')
})
var io = require('socket.io').listen(server);
app.io = io
mongoose.Promise = global.Promise
mongoose.connect('mongodb://localhost/hwc')

server.listen(3000);
app.use(express.static('public'))
//Models
var models_path = __dirname + '/models'
fs.readdirSync(models_path).forEach(function (file) {
  require(models_path+'/'+file)
})
require('./config/passport');

app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser())

//Set pin to out
wpi.setup('wpi')
const devices = require('./device_list.json')
devices.forEach((row) => {
  wpi.pinMode(row.pin, wpi.OUTPUT)
  //wpi.digitalWrite(row.pin, 1)
})

const GpioUtil = require('./util/gpioUtil')

mongoose.model('Group').find({}).populate('devices').exec((err, docs)=> {
  docs.forEach( row=> row.devices.forEach(dev=> GpioUtil.setStatus(dev.pin, row.status)))
})

const dataConsumer = require('./routes/sockets/dataConsumer')
app.io.on('connection', function(socket) {
  dataConsumer(socket)
})

app.use(passport.initialize());

//Route
const devicesRoute = require('././routes/devices');
const groupRoute = require('././routes/groups');
const authRoute = require('././routes/authentication');
const messagesRoute = require('././routes/messages');

app.use('/api/auth', authRoute);
app.use('/api/device', devicesRoute);
app.use('/api/group', groupRoute);
app.use('/api/message', messagesRoute);

app.use(function (err, req, res, next) {
  if (err.name === 'UnauthorizedError') {
    res.status(401);
    res.json({"message" : err.name + ": " + err.message});
  }
  if(err.status !== 404) {
    return next();
  }
  res.send(err.message || '** no unicorns here **');
});
