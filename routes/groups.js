var express = require('express');
var router = express.Router();
const Group = require('../models/group');
const Message = require('../models/message');
const RouteUtil = require('../util/routeUtil');
const AuthUtil = require('../util/authUtil')
const Ajv = require('ajv');
const ajv = new Ajv();
const request = require('request');
const ObjectId = require('mongoose').Types.ObjectId;


const jwt = require('express-jwt');
const auth = jwt({ secret: 'MY_SECRET', userProperty: 'payload' });

//Create group
router.post('/', auth, async (req, res, next) => {
  AuthUtil.requireAdmin(req.payload, res)
  const schema = {
    'properties': {
      'name': {
        'type': 'string'
      },
      'status': {
        'type': 'number'
      },
      'powerStatuses': {
        'type': 'array',
        "items": {
          "powerStatuses": { "type": "string" }
        }
      }
    },
    'required': ['name', 'status', 'powerStatuses']
  };
  try {
    const valid = ajv.validate(schema, req.body);
    if (!valid) throw { code: 400 };
    let createdGroup = await Group.create({ name: req.body.name, status: req.body.status, powerStatuses: req.body.powerStatuses })
    res.status(201).json(createdGroup);
  } catch (e) {
    console.log(e);
    if (e.code !== undefined && e.code === 400)
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
      },
      'powerStatuses': {
        'type': 'array',
        "items": {
          "powerStatuses": { "type": "string" }
        }
      }
    }
  };
  try {
    const valid = ajv.validate(schema, req.body);
    if (!valid) throw { code: 400 };

    let group = await Group.findById(req.params.id).exec()
    Object.assign(group, req.body)
    await group.save();

    res.status(200).json(group);
  } catch (e) {
    console.log(e);
    if (e.code !== undefined && e.code === 400)
      RouteUtil.statusResponse(400, res)
    else
      RouteUtil.statusResponse(500, res)
  }
});

//Get all group
router.get('/', auth, async (req, res, next) => {
  Group.find({}).populate('devices').exec((err, result) => {
    if (err) { RouteUtil.statusResponse(500, res); return; }
    res.json(result);
  });
});

router.get('/powerstationstatuses', async (req, res, next) => {
  request('http://localhost:8080', function (error, response, body) {
    if (!error && response.statusCode == 200) {
      body = JSON.parse(body)
      res.json(body.all_status.filter(i => i!=='Brak'));
    } else {
      res.json([]);
    }
  })
});

router.put('/decision/:id', async (req, res, next) => {
  const schema = {
    'properties': {
      'decision': { "enum": ["ACCEPT", "IGNORE"] }
    },
    'required': ['decision']
  };
  try {
    const valid = ajv.validate(schema, req.body);
    if (!valid) throw { code: 400 };
    let lastObject = await Message.findOne().sort({ _id: -1 }).exec()
    console.log("MODEL_ID", lastObject._id)
    console.log("REQ_ID", lastObject._id.equals(ObjectId(req.params.id)))
    
    if (lastObject._id.equals(ObjectId(req.params.id))) {
      lastObject.decision = req.body.decision
      await lastObject.save()
      //await Group.where({powerStatuses: lastObject.requestType}).update({$set: {status: 0}}).exec() 
      let docs = await Group.find({powerStatuses: lastObject.requestType}).exec();
      let docsToOn = await Group.find({powerStatuses: { $ne: lastObject.requestType}}).exec();
      console.log(docs) 
      docs.forEach(async row => {
        row.status = 0;
        await row.save();
      })
      docsToOn.forEach(async row => {
        row.status = 1;
        await row.save();
      })
      RouteUtil.statusResponse(200, res)
    } else RouteUtil.statusResponse(404, res)
  } catch (e) {
    if (e.code && e.code === 400)
      RouteUtil.statusResponse(400, res)
    else
      RouteUtil.statusResponse(500, res)
  }
})



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
