const express = require('express')
const Ajv = require('ajv')
const ajv = new Ajv()
const router = express.Router()
const RouteUtil = require('../util/routeUtil')
const GpioUtil = require('../util/gpioUtil')
const AuthUtil = require('../util/authUtil')
//Models
const Device = require('../models/device')
const Group = require('../models/group')
//Request shema validators
const createSchema = require('./request_schema/device')

var jwt = require('express-jwt');
var auth = jwt({ secret: 'MY_SECRET', userProperty: 'payload' });

//Create devices
router.post('/', auth, async (req, res, next) => {
  AuthUtil.requireAdmin(req.payload, res)
  try {
      let valid = ajv.validate(createSchema, req.body)
      if(!valid) throw { code: 400 }
      let createdDevice = await Device.create({ pin: req.body.pin, name: req.body.name, group: req.body.group })
      let group = await Group.findByIdAndUpdate(req.body.group, { $push: { devices: createdDevice._id } }).exec();
      createdDevice = await Device.findById(createdDevice._id).populate({path: 'group', select: 'name status'}).exec()
      res.status(201).json(createdDevice)
  } catch (e) {
    console.log(e)
      switch (e.code) {
        case 11000:
          RouteUtil.statusResponse(409, res)
          break;
        case 400:
            RouteUtil.statusResponse(400, res)
            break;
        default:
          RouteUtil.statusResponse(500, res)
      }
  }
})
//Get devices
router.get('/', auth, async (req, res, next) => {
  try {
    let result = await Device.find({}).populate('group', 'name').exec()
    res.status(200).json(result.map(item => ({ _id: item._id, name: item.name, pin: item.pin, status: GpioUtil.getStatus(item.pin), group: item.group })))
  } catch (e) {
    console.log(e);
    RouteUtil.statusResponse(500, res);
  }
});
//Get devices by id
router.get('/:id', auth, async (req, res, next) => {
  try {
      let result = await Device.findById(req.params.id).populate('group', 'name').exec()
      res.status(200).json(result)
  } catch (e) {
    RouteUtil.statusResponse(500, res);
  }
});
//Del device by id
router.delete('/:id', auth, async (req, res, next) => {
  AuthUtil.requireAdmin(req.payload, res)
  try {
      let result = await Device.findByIdAndRemove(req.params.id).exec()
      RouteUtil.statusResponse(204, res);
  } catch (e) {
    RouteUtil.statusResponse(500, res);
  }
});
//Update device
router.put('/:id', auth, async (req, res, next) => {
  AuthUtil.requireAdmin(req.payload, res)
  try {
      let updateSchema = {};
      Object.assign(updateSchema, createSchema);
      delete updateSchema.required;
      console.log(updateSchema);
      let valid = ajv.validate(updateSchema, req.body)
      if(!valid) throw { code: 400, msg: ajv.errors }
      let device = await Device.findById(req.params.id).exec()
      Object.assign(device, req.body)
      await device.save();
      let group = await Group.findByIdAndUpdate(req.body.group, { $push: { devices: device._id } }).exec()
      device = await Device.findById(req.params.id).populate({path: 'group', select: 'name status'}).exec()
      res.status(200).json(device)
  } catch (e) {
    console.log(e)
      if(e.code>=11000) {
        RouteUtil.statusResponse(409, res)
        return
      }
      switch (e.code) {
        case 400:
            RouteUtil.statusResponse(400, res)
            break;
        default:
          RouteUtil.statusResponse(500, res)
      }
  }
});

//Remove devices form group
router.patch('/:id', auth, async (req, res, next) => {
  AuthUtil.requireAdmin(req.payload, res)
  try {
    let device = await Device.findByIdAndUpdate(req.params.id, { $unset: { group: 1 } }).exec();
    await device.model('Group').update(
        { devices: device._id },
        { $pull: { devices: device._id } },
        { multi: true }).exec();
      res.status(200).json(device);
  } catch (e) {
    RouteUtil.statusResponse(500, res);
  }
})

module.exports = router;
