var express = require('express');
var router = express.Router();
const Group = require('../models/group');
const RouteUtil = require('../util/routeUtil');
const AuthUtil = require('../util/authUtil')
const Ajv = require('ajv');
const ajv = new Ajv();


var jwt = require('express-jwt');
var auth = jwt({ secret: 'MY_SECRET', userProperty: 'payload' });

//Create group
router.post('/', auth,async (req, res, next) => {
  AuthUtil.requireAdmin(req.payload, res)
  const schema = {
      'properties': {
          'name': {
              'type': 'string'
          },
          'status': {
              'type': 'number'
          }
      },
      'required': ['name', 'status']
  };
  try {
    const valid = ajv.validate(schema, req.body);
    if(!valid) throw {code: 400};
    let createdGroup = await Group.create({name: req.body.name, status: req.body.status})
    res.status(201).json(createdGroup);
  } catch (e) {
    console.log(e);
    if( e.code !== undefined && e.code === 400 )
      RouteUtil.statusResponse(400, res)
    else
      RouteUtil.statusResponse(500, res)
  }
});


//Update group
router.put('/:id', auth, async (req, res, next) => {
  const schema = {
      'properties': {
          'name': {
              'type': 'string'
          },
          'status': {
              'type': 'number'
          }
      }
  };
  try {
    const valid = ajv.validate(schema, req.body);
    if(!valid) throw {code: 400};

    let group = await Group.findById(req.params.id).exec()
    Object.assign(group, req.body)
    await group.save();

    res.status(200).json(group);
  } catch (e) {
    console.log(e);
    if( e.code !== undefined && e.code === 400 )
      RouteUtil.statusResponse(400, res)
    else
      RouteUtil.statusResponse(500, res)
  }
});

//Get all group
router.get('/', auth, async (req, res, next) => {
  Group.find({}).populate('devices').exec((err,result) => {
    if(err) {RouteUtil.statusResponse(500, res);return;}
    res.json(result);
  });
});


//Del group
router.delete('/:id', auth, async (req, res, next) => {
  AuthUtil.requireAdmin(req.payload, res)
  try {
      let result = await Group.findByIdAndRemove(req.params.id).exec()
      console.log(result);
      RouteUtil.statusResponse(204, res);
  } catch (e) {
    RouteUtil.statusResponse(500, res);
  }
});


module.exports = router;
