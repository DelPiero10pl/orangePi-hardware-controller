var express = require('express');
var router = express.Router();
const Group = require('../models/group');
const RouteUtil = require('../util/routeUtil');
const Ajv = require('ajv');
const ajv = new Ajv();


router.post('/', function(req, res, next) {
  const schema = {
    'properties': {
      'name': { 'type': 'string' }
    },
    'required': [ 'name' ]
  };
  const valid = ajv.validate(schema, req.body);
  if(!valid) {
    RouteUtil.errResponse(400, 'Bad request', res);
    return;
  }
  const group = new Group({
    name: req.body.name,
  });
  group.save((err)=> {
    if(err) {RouteUtil.errResponse(500, err, res);return;}
    res.json(group);
  });
});

router.get('/', function(req, res, next) {
  Group.find({}).populate('devices').exec((err,result) => {
    if(err) {RouteUtil.errResponse(500, err, res);return;}
    res.json(result.map(item=>({
      id: item._id,
      name: item.name,
      devices: item.devices
    })));
  });
});

router.post('/devices', function(req, res, next) {
  res.json({msg: "Dodaje urządzenia do grupy"});
});

router.delete('/devices/:ids', function(req, res, next) {
  res.json({msg: "Usuwanie"});
});

router.delete('/devices/:ids', function(req, res, next) {
  res.json({msg: "Usuwanie"});
});

router.put('/devices/:ids', function(req, res, next) {
  res.json({msg: "Zmiana grupy "});
});




module.exports = router;
