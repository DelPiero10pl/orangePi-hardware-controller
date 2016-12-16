const express = require('express');
const router = express.Router();
const Device = require('../models/device');
const Group = require('../models/group');
const Ajv = require('ajv');
const ajv = new Ajv();

router.post('/', function(req, res, next) {
  const schema = {
    'properties': {
      'pin': { 'type': 'number' },
      'name': { 'type': 'string' }
    },
    'required': [ 'pin', 'name' ]
  };
  const valid = ajv.validate(schema, req.body);
  if (!valid) {
    errResponse(400, 'Bad Request', res);
    return;
  }

  Device.create({
    pin: req.body.pin,
    name: req.body.name,
    group: req.body.group
  }, (err, device) => {
    if(!err) {
      //Group.find({})
      res.status(201);
      res.json(device);
    } else if(err.code === 11000)
          errResponse(409, 'Conflict', res);
      else
        errResponse(500, 'Internal Server Error', res);
  });


});

router.get('/', function(req, res, next) {
  Device.find({})
            .populate('group')
            .exec(function(err, posts) {
                if(err) errResponse(500, "Internal Server Error", res);
                res.json(posts.map(item => ({ id: item._id, name: item.name, group: item.group })));
  });
});

router.get('/:id', function(req, res, next) {
  res.json({msg: 'Urządzenie o id'});
});

router.put('/:id', function(req, res, next) {
  res.json({msg: 'Update po id'});
});

// router.get('/', function(req, res, next) {
//   res.json({msg: 'Wszystkie grupy'});
// });

function errResponse(status, msg, res) {
  res.status(status);
  res.json({err: status, msg: msg});
}



module.exports = router;
