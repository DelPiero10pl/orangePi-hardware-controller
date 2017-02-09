const passport = require('passport');
const mongoose = require('mongoose');
const User = mongoose.model('User');
const express = require('express')
const router = express.Router()
const RouteUtil = require('../util/routeUtil')
const AuthUtil = require('../util/authUtil')
const Ajv = require('ajv');
const ajv = new Ajv();
const jwt = require('express-jwt');
const auth = jwt({ secret: 'MY_SECRET', userProperty: 'payload' });

router.post('/register', async (req, res, next) => {
    User.count({}, (err, count) => {
        if(count>=2) {
            RouteUtil.statusResponse(403, res)
            return
        }
        const user = new User();
        if(count == 0) {
            user.acountType = 'Admin';
            user.username = 'administrator';
        } else {
            user.acountType = 'User';
            user.username = 'user';
        }
        user.setPassword(req.body.password);
        user.save(e => {
            if (e) {
                if (e.code >= 11000) {
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
            } else {
                var token;
                token = user.generateJwt();
                res.status(200);
                res.json({
                    "token": token
                });
            }
        });
    })
});

router.post('/login', async (req, res, next) => {
    passport.authenticate('local', function (err, user, info) {
        var token;

        // If Passport throws/catches an error
        if (err) {
            res.status(404).json(err);
            return;
        }
        // If a user is found
        if (user) {
            token = user.generateJwt();
            res.status(200);
            res.json({
                "token": token
            });
        } else {
            // If user is not found
            res.status(401).json(info);
        }
    })(req, res);
});


router.post('/changeuserpassword', auth, async (req, res, next) => {
    AuthUtil.requireAdmin(req.payload, res)
    try {
        const user = await User.findOne({username: 'user', acountType: 'User'}).exec()
        user.setPassword(req.body.password)
        await user.save()
        RouteUtil.statusResponse(200, res)
    } catch(e) {
        RouteUtil.statusResponse(500, res)
    }
})

module.exports = router;