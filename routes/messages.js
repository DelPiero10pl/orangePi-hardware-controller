const  express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Message = mongoose.model('Message');
const RouteUtil = require('../util/routeUtil');
const AuthUtil = require('../util/authUtil')
const jwt = require('express-jwt');
const auth = jwt({ secret: 'MY_SECRET', userProperty: 'payload' });
/* GET home page. */
router.get('/clean', auth, async (req, res, next) => {
  AuthUtil.requireAdmin(req.payload, res)
  try {
    await Message.remove({}).exec()
    RouteUtil.statusResponse(200,res);
  } catch(e) {
    RouteUtil.statusResponse(500,res);
  }
});

router.get('/', auth, async (req, res, next) => {
  try {
   const messages = await Message.find().sort({_id: -1}).limit(100).exec()
   res.json(messages)
  }catch (e) {
    RouteUtil.statusResponse(500,res);
  }
})

module.exports = router;
