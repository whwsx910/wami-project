var express = require('express');
var router = express.Router();
var User = require("../models/user");
var helper = require("../helpers/helper");
var msger = require("../helpers/msger");



/* GET users listing. */
// router.get('/:pw', function(req, res, next) {
//     //res.status(200).send(helper.encrypt(req.params.pw));
// });

//making some changes

// router.get('/add/:name/:email/:password', function(req, res, next) {
//     //Query database and send back all matched stores
//     User.find({
//         email: req.params.email
//     }, function(err, users) {
//         if (err) return console.error(err);
//         if (users.length !== 0) {
//             //check database for exsiting email
//             res.status(200).send({
//                 act: "signup",
//                 success: 0,
//                 error: "Email" + req.params.email + " already exist"
//             });
//         }
//         else {
//             //insert data into database.
//             var user = new User({
//                 name: req.params.name,
//                 email: req.params.email,
//                 password: helper.encrypt(req.params.password) //encrypt password before saving it.
//             });
//             user.save(function(err) {
//                 if (err) return console.error(err);
//                 res.status(200).send({
//                     act: "signup",
//                     success: 1,
//                     error: ""
//                 });
//             });
//         }
//         //res.send(JSON.stringify(req.param("name"))); 
//     });
// });

router.get('/getuser/:UID', function(req, res, next) {
    if (!req.params.UID) {
        res.send({
            act: "getuser",
            success: 0,
            error: "Missing UID"
        });
    }
    else {
        User.findOne({
                _id: req.params.UID
            }, {
                _id: 1,
                name: 1
            },
            function(err, users) {
                if (err) return console.log(err);
                res.send(users);
            });
    }
});

router.post('/adduser', function(req, res, next) {
    //Query database and send back all matched stores

    if (!req.body.email) {
        res.send({
            act: "signup",
            success: 0,
            error: "Missing email"
        });
    }
    else if (!req.body.password) {
        res.send({
            act: "signup",
            success: 0,
            error: "Missing password"
        });
    }
    else if (!req.body.name) {
        res.send({
            act: "signup",
            success: 0,
            error: "Missing name"
        });
    }
    else {
        User.findOne({
            email: req.body.email.toLowerCase()
        }, function(err, users) {
            if (err) return console.error(err);
            if (users) {
                //check database for exsiting email
                res.status(200).send({
                    act: "signup",
                    success: 0,
                    error: "Email " + req.body.email + " already exist"
                });
            }
            else {
                //insert data into database.
                var user = new User({
                    name: req.body.name,
                    email: req.body.email.toLowerCase(),
                    password: helper.encrypt(req.body.password), //encrypt password before saving it.
                    birthday: req.body.birthday,
                    phone: req.body.phone
                });
                //send email message
                msger.sendConfirmation({
                    emailTo: user.email,
                    emailFrom: "no-reply@quamenu.com",
                    subject: "Thanks for sign up with us",
                    HTML: "<a href='http://" + req.hostname + "/vip'>Login</a> to see your profile",
                    name: user.name
                });
                user.save(function(err) {
                    if (err) return console.error(err);
                    res.status(200).cookie('userID', user._id.toString(), {
                        maxAge: 262974000,
                        httpOnly: true
                    }).send({
                        act: "signup",
                        success: 1,
                        error: "",
                        _id: user._id.toString(),
                        name: user.name,
                        email: user.email,
                        birthday: user.birthday,
                        phone: user.phone,
                        login_times: 0,
                        checkin_times: 0
                    });
                });
            }
        });
    }
    //res.send(JSON.stringify(req.body));
});

router.post('/login', function(req, res, next) {
    //Query database and send back all matched stores

    if (!req.body.email) {
        res.send({
            act: "login",
            success: 0,
            error: "missing email"
        });
    }
    else if (!req.body.password) {
        res.send({
            act: "login",
            success: 0,
            error: "missing password"
        });
    }
    else {
        User.findOne({
            email: req.body.email.toLowerCase()
        }, function(err, users) {
            if (err) return console.error(err);
            if (users !== null) {
                //check database for exsiting email
                //res.send(users[0].password);
                if (helper.encrypt(req.body.password) === users.password) {
                    var loginDate = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
                    users.login_log.push(loginDate);
                    users.save(function(err) {
                        if (err) return console.error(err);
                        // res.status(200).send({
                        //     act: "login_log",
                        //     success: 1,
                        //     error: "",
                        //     _id: users._id.toString()
                        // });
                    });
                    res.status(200).cookie('userID', users._id.toString(), {
                        maxAge: 2592000000,
                        httpOnly: true
                    }).send({
                        act: "login",
                        success: 1,
                        _id: users._id.toString(),
                        name: users.name,
                        email: users.email,
                        birthday: users.birthday,
                        phone: users.phone,
                        login_times: users.login_log.length,
                        checkin_times: users.checkin_log.length
                    });
                }
                else {
                    res.send({
                        act: "login",
                        success: 0,
                        error: "Password is invalid!"
                    });
                }

            }
            else {
                //insert data into database.
                res.send({
                    act: "login",
                    success: 0,
                    error: "User not found!"
                });
            }
        });
    }
});

router.post('/FBlogin', function(req, res, next) {
    User.findOne({
        email: req.body.email.toLowerCase()
    }, function(err, users) {
        if (err) return console.error(err);
        if (users !== null) {
            //check database for exsiting email
            var FBloginDate = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
            users.login_log.push(FBloginDate);
            users.save(function(err) {
                if (err) return console.error(err);
            });

            User.findOneAndUpdate({
                email: req.body.email.toLowerCase()
            }, {
                device_token: req.body.device_token
            }, function(err, doc) {
                if (err) return console.error(err);
            });

            res.status(200).cookie('userID', users._id.toString(), {
                maxAge: 2592000000,
                httpOnly: true
            }).send({
                act: "FBlogin",
                success: 1,
                error: "",
                _id: users._id.toString(),
                email: users.email.toLowerCase(),
                name: users.name,
                birthday: users.birthday,
                phone: users.phone,
                fb_id: users.fb_id, //encrypt password before saving it.
                device_token: req.body.device_token,
                login_times: users.login_log.length,
                checkin_times: users.checkin_log.length
            });
        }
        else {
            //insert data into database.
            var user = new User({
                email: req.body.email.toLowerCase(),
                name: req.body.name,
                fb_id: req.body.fb_id, //encrypt password before saving it.
                device_token: req.body.device_token
            });
            //send email message
            // msger.sendConfirmation({
            //     emailTo: 'whwsx910@gmail.com',
            //     emailFrom: "no-reply@quamenu.com",
            //     subject: "Thanks for sign up with Quamenu",
            //     HTML: "User the link below to reset your password<br><a href='http://www.google.com'>click to reset</a>",
            //     name: user.name
            // });
            user.save(function(err) {
                if (err) return console.error(err);
            });

            User.findOne({
                email: req.body.email.toLowerCase()
            }, function(err, newUser) {
                if (err) return console.error(err);
                res.status(200).cookie('userID', newUser._id.toString(), {
                    maxAge: 2592000000,
                    httpOnly: true
                }).send({
                    act: "FBsignup",
                    success: 1,
                    error: "",
                    _id: newUser._id.toString(),
                    email: newUser.email.toLowerCase(),
                    name: newUser.name,
                    birthday: newUser.birthday,
                    phone: newUser.phone,
                    fb_id: newUser.fb_id, //encrypt password before saving it.
                    device_token: req.body.device_token,
                    login_times: 0,
                    checkin_times: 0
                });
            });

        }
    });
});


router.post('/weblogout', function(req, res, next) {
    //Query database and send back all matched stores
    res.status(200).clearCookie('userID').send({
        act: "weblogout",
        success: 1
    });
});


router.post('/verifyemail', function(req, res, next) {

    if (req.body.email === undefined) {
        res.send({
            act: "verifyemail",
            success: 0,
            error: "Missing email, please re-enter"
        });
    }
    else {
        User.findOne({
            email: req.body.email.toLowerCase()
        }, function(err, users) {
            if (err) return console.error(err);
            if (!users) {
                //check database for exsiting email
                res.status(200).send({
                    act: "verifyemail",
                    success: 0,
                    error: "Email " + req.body.email + " does not exist."
                });
            }
            else {
                msger.sendConfirmation({
                    emailTo: req.body.email,
                    emailFrom: "no-reply@juxingktv.com",
                    subject: "VIP Password Reset - Wok and Roll",
                    HTML: "Please click the following link to reset your password: <a href='http://" + req.hostname + "/resetpassword?UID=" + users._id.toString() + "'>reset my password</a>",
                    name: users.name
                });
                res.status(200).send({
                    act: "verifyemail",
                    success: 1,
                });
            }
        });
    }

    //res.send(JSON.stringify(req.body));
});

router.post('/resetpw', function(req, res, next) {
    //Query database and send back all matched stores
    if (req.body.password === undefined) {
        res.status(200).send({
            act: "resetpassword",
            success: 0,
            error: "missing password"
        });
    }
    else {
        User.findOne({
            _id: req.body.UID
        }, function(err, users) {
            if (err) return console.error(err);
            if (users) {
                //check database for modifying user password
                //res.send(users[0].password);
                User.findOneAndUpdate({
                    _id: req.body.UID
                }, {
                    password: helper.encrypt(req.body.password)
                }, function(err, doc) {
                    if (err) return console.error(err);
                    res.status(200).send({
                        act: "update password",
                        success: 1
                    });
                });
            }
            else {
                res.status(200).send({
                    act: "resetpassword",
                    success: 0,
                    error: "User not found!"
                });
            }
        });
    }

    //res.send(JSON.stringify(req.body));
});


router.post('/checkin', function(req, res, next) {
    //Query database and send back all matched stores
    if (req.body.scan_token === "aabbcc") {
        if (req.body.UID === undefined) {
            res.status(200).send({
                act: "checkin",
                success: 0,
                error: "missing userID"
            });
        }
        else {
            User.findOne({
                _id: req.body.UID
            }, function(err, users) {
                if (err) return console.error(err);
                if (users) {
                    //check database for modifying user password

                    User.findOneAndUpdate({
                        _id: req.body.UID
                    }, {
                        checkin: true

                    }, function(err, doc) {
                        if (err) return console.error(err);
                    });

                    var checkinDate = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
                    users.checkin_log.push(checkinDate);
                    users.save(function(err) {
                        if (err) return console.error(err);
                        res.status(200).send({
                            act: "checkin",
                            success: 1,
                            error: "",
                            checkin_times: users.checkin_log.length,
                            scan_token: req.body.scan_token
                        });
                    });
                }
                else {
                    res.status(200).send({
                        act: "checkin",
                        success: 0,
                        error: "User not found!"
                    });
                }
            });
        }
        //res.send(JSON.stringify(req.body));
    }
    else {
        res.status(200).send({
            act: "checkin",
            success: 0,
            error: "It is not scanning machine!"
        });
    }
});


router.post('/checkinverify', function(req, res, next) {
    //Query database and send back all matched stores
    if (req.body.scan_token === "aabbcc") {
        if (req.body.UID === undefined || req.body.UID === null) {
            res.status(200).send({
                act: "checkinverify",
                success: 0,
                error: "missing userID to verify"
            });
        }
        else {
            User.findOne({
                _id: req.body.UID
            }, function(err, users) {
                if (err) return console.error(err);
                if (users) {
                    //check database for modifying user password
                    if (users.checkin === true) {
                        res.status(200).send({
                            act: "checkinverify",
                            success: 1,
                            checkin_times: users.checkin_log.length,
                            scan_token: req.body.scan_token
                        });
                    }
                    else {
                        res.status(200).send({
                            act: "checkinverify",
                            success: 0,
                            error: "you haven't checkin today, please checkin",
                            checkin_times: users.checkin_log.length,
                            scan_token: req.body.scan_token
                        });
                    }
                }
                else {
                    res.status(200).send({
                        act: "checkinverify",
                        success: 0,
                        error: "User not found!"
                    });
                }
            });
        }
        //res.send(JSON.stringify(req.body));
    }
    else {
        res.status(200).send({
            act: "checkinverify",
            success: 0,
            error: "It is not scanning machine!"
        });
    }
});




router.post('/apns', function(req, res, next) {
    var msgConfig = {
        payload: {
            "description": "A good news !"
        },
        badge: 3,
        sound: "dong.aiff",
        alertMsg: "Shake and Win",
        tokens: ["57339274ad0ae9d738eb6beecf00361cb569da92b2ae49fd529f31a913120735"]
    }
    msger.sendPushNotification(msgConfig);
    res.send({
        act: "send apns",
        success: 1,
        error: ""
    });
});


router.post('/editprofile', function(req, res, next) {

    if (req.body.UID === undefined) {
        res.status(200).send({
            act: "editprofile",
            success: 0,
            error: "missing users information"
        });
    }
    else {
        User.findOne({
            _id: req.body.UID
        }, function(err, users) {
            if (err) return console.error(err);
            if (users) {

                User.findOneAndUpdate({
                    _id: req.body.UID
                }, req.body, function(err, doc) {
                    if (err) return console.error(err);
                    res.send({
                        act: "editprofile",
                        success: 1
                    });
                });
            }
            else {
                res.status(200).send({
                    act: "editprofile",
                    success: 0,
                    error: "User not found!"
                });
            }
        });
    }
});

router.get('/resetallcheckin/:passcode', function(req, res, next) {
    if (req.params.passcode !== 'ggle') {
        res.send({
            act: "reset all checin",
            success: 0,
            error: "wrong passcode"
        });
    }
    else {
        User.update({
                checkin: true
            }, {
                $set: {
                    checkin: false
                }
            }, {
                multi: true
            },
            function(err, users) {
                if (err) return console.log(err);
                res.send(users);
            });
    }
});


router.post('/myaccinfo', function(req, res, next) {

    if (req.body.UID === undefined) {
        res.status(200).send({
            act: "myaccinfo",
            success: 0,
            error: "missing users information"
        });
    }
    else {

        User.findOne({
            _id: req.body.UID
        }, function(err, users) {
            if (err) return console.error(err);
            if (users) {

                var cur_checkin_left = Math.floor(users.checkin_log.length / 5);
                var cur_reward_left = users.reward.length;
                var cur_resvs_left = users.resvs.length;
                if (users.checkin_left === undefined) {
                    if (users.reward_left === undefined) {
                        if (users.resvs_left === undefined) {

                            res.status(200).send({
                                act: "myaccinfo 1",
                                success: 1,
                                checkin_times: users.checkin_log.length,
                                checkin_redeem_times: users.checkin_redeem,
                                checkin_left_times: cur_checkin_left,
                                reward_times: users.reward.length,
                                reward_redeem_times: users.reward_redeem,
                                reward_left_times: cur_reward_left,
                                resvs_times: users.resvs.length,
                                resvs_redeem_times: users.resvs_redeem,
                                resvs_left_times: cur_resvs_left
                            });
                        }
                        else {
                            res.status(200).send({
                                act: "myaccinfo 2",
                                success: 1,
                                checkin_times: users.checkin_log.length,
                                checkin_redeem_times: users.checkin_redeem,
                                checkin_left_times: cur_checkin_left,
                                reward_times: users.reward.length,
                                reward_redeem_times: users.reward_redeem,
                                reward_left_times: cur_reward_left,
                                resvs_times: users.resvs.length,
                                resvs_redeem_times: users.resvs_redeem,
                                resvs_left_times: users.resvs_left
                            });
                        }
                    }
                    else {
                        if (users.resvs_left === undefined) {
                            res.status(200).send({
                                act: "myaccinfo 3",
                                success: 1,
                                checkin_times: users.checkin_log.length,
                                checkin_redeem_times: users.checkin_redeem,
                                checkin_left_times: cur_checkin_left,
                                reward_times: users.reward.length,
                                reward_redeem_times: users.reward_redeem,
                                reward_left_times: users.reward_left,
                                resvs_times: users.resvs.length,
                                resvs_redeem_times: users.resvs_redeem,
                                resvs_left_times: cur_resvs_left
                            });
                        }
                        else {
                            res.status(200).send({
                                act: "myaccinfo 4",
                                success: 1,
                                checkin_times: users.checkin_log.length,
                                checkin_redeem_times: users.checkin_redeem,
                                checkin_left_times: cur_checkin_left,
                                reward_times: users.reward.length,
                                reward_redeem_times: users.reward_redeem,
                                reward_left_times: users.reward_left,
                                resvs_times: users.resvs.length,
                                resvs_redeem_times: users.resvs_redeem,
                                resvs_left_times: users.resvs_left
                            });
                        }
                    }
                }
                else {

                    if (users.reward_left === undefined) {
                        if (users.resvs_left === undefined) {
                            res.status(200).send({
                                act: "myaccinfo 5",
                                success: 1,
                                checkin_times: users.checkin_log.length,
                                checkin_redeem_times: users.checkin_redeem,
                                checkin_left_times: users.checkin_left,
                                reward_times: users.reward.length,
                                reward_redeem_times: users.reward_redeem,
                                reward_left_times: cur_reward_left,
                                resvs_times: users.resvs.length,
                                resvs_redeem_times: users.resvs_redeem,
                                resvs_left_times: cur_resvs_left
                            });
                        }
                        else {
                            res.status(200).send({
                                act: "myaccinfo 6",
                                success: 1,
                                checkin_times: users.checkin_log.length,
                                checkin_redeem_times: users.checkin_redeem,
                                checkin_left_times: users.checkin_left,
                                reward_times: users.reward.length,
                                reward_redeem_times: users.reward_redeem,
                                reward_left_times: cur_reward_left,
                                resvs_times: users.resvs.length,
                                resvs_redeem_times: users.resvs_redeem,
                                resvs_left_times: users.resvs_left
                            });
                        }
                    }
                    else {
                        if (users.resvs_left === undefined) {
                            res.status(200).send({
                                act: "myaccinfo 7",
                                success: 1,
                                checkin_times: users.checkin_log.length,
                                checkin_redeem_times: users.checkin_redeem,
                                checkin_left_times: users.checkin_left,
                                reward_times: users.reward.length,
                                reward_redeem_times: users.reward_redeem,
                                reward_left_times: users.reward_left,
                                resvs_times: users.resvs.length,
                                resvs_redeem_times: users.resvs_redeem,
                                resvs_left_times: cur_resvs_left
                            });
                        }
                        else {
                            res.status(200).send({
                                act: "myaccinfo 8",
                                success: 1,
                                checkin_times: users.checkin_log.length,
                                checkin_redeem_times: users.checkin_redeem,
                                checkin_left_times: users.checkin_left,
                                reward_times: users.reward.length,
                                reward_redeem_times: users.reward_redeem,
                                reward_left_times: users.reward_left,
                                resvs_times: users.resvs.length,
                                resvs_redeem_times: users.resvs_redeem,
                                resvs_left_times: users.resvs_left
                            });
                        }
                    }
                }
            }

            else {
                res.status(200).send({
                    act: "myaccinfo",
                    success: 0,
                    error: "User not found!"
                });
            }
        });
    }
});


router.post('/redeemcheckin', function(req, res, next) {

    if (req.body.UID === undefined || req.body.UID === null) {
        res.status(200).send({
            act: "redeemcheckin",
            success: 0,
            error: "missing users ID"
        });
    }
    else {
        User.findOne({
            _id: req.body.UID
        }, function(err, users) {
            if (err) return console.error(err);
            if (users) {

                var cur_checkin_redeem = users.checkin_redeem + 1;
                var cur_checkin_left = Math.floor(users.checkin_log.length / 5) - cur_checkin_redeem;

                if (cur_checkin_left >= 0) {
                    User.findOneAndUpdate({
                        _id: req.body.UID
                    }, {
                        checkin_redeem: cur_checkin_redeem,
                        checkin_left: cur_checkin_left
                    }, function(err, doc) {
                        if (err) return console.error(err);
                        res.status(200).send({
                            act: "redeemcheckin",
                            success: 1,
                            checkin_times: users.checkin_log.length,
                            checkin_redeem_times: cur_checkin_redeem,
                            checkin_left_times: cur_checkin_left
                        });
                    });
                }
                else {
                    res.status(200).send({
                        act: "redeemcheckin",
                        success: 0,
                        error: "No rewards anymore"
                    });
                }
            }
            else {
                res.status(200).send({
                    act: "redeemcheckin",
                    success: 0,
                    error: "User not found!"
                });
            }
        });
    }
});


router.post('/redeemreward', function(req, res, next) {

    if (req.body.UID === undefined || req.body.UID === null) {
        res.status(200).send({
            act: "redeemreward",
            success: 0,
            error: "missing users ID"
        });
    }
    else {
        User.findOne({
            _id: req.body.UID
        }, function(err, users) {
            if (err) return console.error(err);
            if (users) {

                var cur_reward_redeem = users.reward_redeem + 1;
                var cur_reward_left = users.reward.length - cur_reward_redeem;

                if (cur_reward_left >= 0) {
                    User.findOneAndUpdate({
                        _id: req.body.UID
                    }, {
                        reward_redeem: cur_reward_redeem,
                        reward_left: cur_reward_left
                    }, function(err, doc) {
                        if (err) return console.error(err);
                        res.status(200).send({
                            act: "redeemreward",
                            success: 1,
                            reward_times: users.reward.length,
                            reward_redeem_times: cur_reward_redeem,
                            reward_left_times: cur_reward_left
                        });
                    });
                }
                else {
                    res.status(200).send({
                        act: "redeemreward",
                        success: 0,
                        error: "No rewards anymore"
                    });
                }
            }
            else {
                res.status(200).send({
                    act: "redeemreward",
                    success: 0,
                    error: "User not found!"
                });
            }
        });
    }
});


router.post('/redeemresvs', function(req, res, next) {

    if (req.body.UID === undefined || req.body.UID === null) {
        res.status(200).send({
            act: "redeemresvs",
            success: 0,
            error: "missing users ID"
        });
    }
    else {
        User.findOne({
            _id: req.body.UID
        }, function(err, users) {
            if (err) return console.error(err);
            if (users) {

                var cur_resvs_redeem = users.resvs_redeem + 1;
                var cur_resvs_left = users.resvs.length - cur_resvs_redeem;

                if (cur_resvs_left >= 0) {
                    User.findOneAndUpdate({
                        _id: req.body.UID
                    }, {
                        resvs_redeem: cur_resvs_redeem,
                        resvs_left: cur_resvs_left
                    }, function(err, doc) {
                        if (err) return console.error(err);
                        res.status(200).send({
                            act: "redeemresvs",
                            success: 1,
                            resvs_times: users.resvs.length,
                            resvs_redeem_times: cur_resvs_redeem,
                            resvs_left_times: cur_resvs_left
                        });
                    });
                }
                else {
                    res.status(200).send({
                        act: "redeemresvs",
                        success: 0,
                        error: "No redeem reservation anymore"
                    });
                }
            }
            else {
                res.status(200).send({
                    act: "redeemresvs",
                    success: 0,
                    error: "User not found!"
                });
            }
        });
    }
});

module.exports = router;