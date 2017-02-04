const passport = require('passport');
const mongoose = require('mongoose');
const User = mongoose.model('User');
const express = require('express')
const router = express.Router()
const RouteUtil = require('../util/routeUtil')


router.post('/register', async (req, res, next) => {
    User.count({}, function (err, count) {
        var user = new User();
        user.acountType = (count == 0) ? 'Admin' : 'User';
        user.username = req.body.username;
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

module.exports = router;