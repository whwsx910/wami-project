var express = require('express');
var router = express.Router();
var Reward = require("../models/reward");
var User = require("../models/user");
var helper = require("../helpers/helper");
var msger = require("../helpers/msger");


var CHANCE_TO_WIN = process.env.CHANCE_TO_WIN || 3;
var SAW_rewardNumber = 0;
var SAW_active = false;


//sync up event in memory with event in DB
function syncSAWEvents() {
    Reward.findOne({
            active: true
        }, {},
        function(err, reward) {
            if (err) return console.log(err);
            if (reward !== null) {
                SAW_rewardNumber = reward.remaining;
                SAW_active = reward.active;
            }
            console.log('SAW event data synced');
        });
};

syncSAWEvents();

/* GET users listing. */
router.post('/shakeandwin', function(req, res, next) {
    if (req.body.UID === null || req.body.UID === undefined) {
        res.send({
            act: "SAW",
            success: 0,
            error: "missing UID"
        });
    }
    else {
        if (SAW_active === true && SAW_rewardNumber > 0) {
            var r = Math.random() * 10;
            if (r < CHANCE_TO_WIN) {
                //check and see if there are rewards left, if not, end the event.
                SAW_rewardNumber -= 1;
                User.findOne({
                    _id: req.body.UID
                }, function(err, users) {
                    if (err) return console.error(err);
                    if (users) {
                        //find the event that's currently active and add winner to the winner list.
                        Reward.findOne({
                            active: true
                        }, function(err, rewards) {
                            if (err) return console.error(err);
                            if (rewards !== null) {
                                var cur_winner = req.body.UID;
                                rewards.winners.push(cur_winner);
                                rewards.save(function(err) {
                                    if (err) return console.error(err);
                                });
                                var r_date = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
                                var r_id = rewards._id;
                                var cur_reward = {
                                    "r_date": r_date,
                                    "r_id": r_id
                                };
                                users.reward.push(cur_reward);
                                if (users.reward_left === undefined || users.reward_left === null) {
                                    users.reward_left = 1;
                                    users.save(function(err) {
                                        if (err) return console.error(err);
                                    });
                                }
                                else {
                                    User.findOneAndUpdate({
                                        _id: req.body.UID
                                    }, {
                                        reward_left: users.reward_left + 1
                                    }, function(err, users) {
                                        if (err) return console.error(err);
                                    });
                                }
                                users.save(function(err) {
                                    if (err) return console.error(err);
                                    res.status(200).send({
                                        act: "shake and win",
                                        msg: "You Win!!",
                                        success: 1,
                                        win: 1,
                                        error: "",
                                        reward_id: rewards._id,
                                    });
                                });
                            }
                        });

                        if (SAW_rewardNumber > 0) {
                            Reward.findOneAndUpdate({
                                active: true
                            }, {
                                remaining: SAW_rewardNumber
                            }, function(err, doc) {
                                if (err) return console.error(err);
                            });
                        }
                        else {
                            Reward.findOneAndUpdate({
                                active: true
                            }, {
                                remaining: SAW_rewardNumber,
                                active: false
                            }, function(err, doc) {
                                if (err) return console.error(err);

                            });
                            SAW_active = false;
                        }
                    }
                });
            }
            else {
                res.status(200).send({
                    act: "shake and win",
                    success: 1,
                    win: 0,
                    msg: 'Thanks for trying'
                });
            }
        }
        else {
            res.send({
                success: 0,
                win: 0,
                event_active: SAW_active,
                remaining: SAW_rewardNumber
            })
        }
    }
});


router.post('/caniplay', function(req, res, next) {
    syncSAWEvents();
    if (!SAW_active) {
        res.send({
            success: 0,
            error: "Event is not active",
            code: 1
        });
    }
    else if (SAW_rewardNumber <= 0) {
        res.send({
            success: 0,
            error: "No reward left",
            code: 2
        });
    }
    else {
        // Reward.findOne({
        //     active: true,
        //     winners: req.body.UID
        // }, function(err, rewards) {
        //     if (err) return console.error(err);
        //     if (rewards !== null) {
        //         res.send({
        //             success: 0,
        //             error: "You've already won the prize!",
        //             code: 3
        //         });
        //     }
        //     else {
        //         res.send({
        //             success: 1,
        //             msg: "Shake and Win now!",
        //             active: SAW_active,
        //             remaining: SAW_rewardNumber
        //         });
        //     }
        // });
        res.send({
            success: 1,
            msg: "Shake and Win now!",
            active: SAW_active,
            remaining: SAW_rewardNumber
        });
    }
});

router.get('/SAWStatus', function(req, res, next) {
    res.status(200).send({
        remaining: SAW_rewardNumber,
        active: SAW_active
    })
});

//This API is needed for kicking off SAW events from backend web system. Not for app.
router.post('/startSAW', function(req, res, next) {
    //if there is already a SAW active, let it go, else create a new shake and win event record and reset flags
    if (SAW_active || SAW_rewardNumber) {
        Reward.findOneAndUpdate({
                active: true
            }, {
                active: false,
                expired: new Date()
            },
            function(err, reward) {
                if (err) return console.log(err);
            });
        // res.send({
        //     act: "Start a new Shake and Win",
        //     success: 0,
        //     error: "Another event is already active"
        // });
    }
    SAW_rewardNumber = req.body.SAW_rewardNumber || 10;
    SAW_active = req.body.SAW_active;
    var reward = new Reward({
        created: new Date(),
        total: SAW_rewardNumber,
        remaining: SAW_rewardNumber,
        active: true
    });
    reward.save(function(err) {
        if (err) return console.error(err);
        res.send({
            success: 1,
            event_active: SAW_active,
            remaining: SAW_rewardNumber
        });
    });
    syncSAWEvents();
});

router.post('/turnoffSAW', function(req, res, next) {

    if (SAW_active || SAW_rewardNumber) {
        Reward.findOneAndUpdate({
                active: true
            }, {
                active: false,
                expired: new Date()
            },
            function(err, reward) {
                if (err) return console.log(err);
            });
        res.send({
            act: "Turn off Shake and Win",
            success: 1,
            error: ""
        });
    }
    else {
        res.send({
            act: "Turn off Shake and Win",
            success: 0,
            error: "there has no active SAW"
        });
    }
});


module.exports = router;