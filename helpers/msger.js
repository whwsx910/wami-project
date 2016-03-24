var apns = require("apns");
var apn = require('apn');
var sendgrid = require('sendgrid')('app40691577@heroku.com', 'zqhragfg0787');

module.exports.sendConfirmation = function(options) {
    var email = new sendgrid.Email({
        to: options.emailTo,
        from: options.emailFrom,
        subject: options.subject,
        html: options.HTML, // This fills out the <%body%> tag inside your SendGrid template
    });

    // // Tell SendGrid which template to use, and what to substitute. You can use as many substitutions as you want.
    // email.setFilters({
    //     "templates": {
    //         "settings": {
    //             "enabled": 1,
    //             "template_id": "c279c2c9-3146-4a86-a149-b33be224e3ea"
    //         }
    //     }
    // }); // Just replace this with the ID of the template you want to use
    // email.addSubstitution('-name-', options.name); // You don't need to have a subsitution, but if you want it, here's how you do that :)

    // Everything is set up, let's send the email!
    sendgrid.send(email, function(err, json) {
        if (err) {
            console.error(err);
        }
        else {
            console.log('Email sent!');
        }
    });
}


// send apple push notification This is out of date
// module.exports.sendPushNotification = function(msgConfig) {
//     var connection, notification;
//     var options = {
//         keyFile: "conf/PushChatKey.pem",
//         certFile: "conf/PushChatCert.pem",
//         debug: true,
//         passphrase: "CJT3wsAB",
//         gateway: "gateway.sandbox.push.apple.com",
//         port: "2195"
//     };

//     connection = new apns.Connection(options);

//     for (var i = 0; i < msgConfig.tokens.length; i++) {
//         notification = new apns.Notification();
//         notification.payload = msgConfig.payload;
//         notification.badge = msgConfig.badge;
//         notification.sound = msgConfig.sound;
//         notification.alert = msgConfig.alertMsg;
//         notification.device = new apns.Device(msgConfig.tokens[i]);
//         connection.sendNotification(notification);
//     };
// }



//send apple push notification
module.exports.sendPushNotification = function(msgConfig) {
    var myDevice = new apn.Device(msgConfig.tokens[0]);
    var note = new apn.Notification();

    var options = {
        cert: "./conf/cert.pem",
        key: "./conf/key.pem",
        passphrase: "CJT3wsAB"
    };
    var apnConnection = new apn.Connection(options);
    
    note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
    note.badge = msgConfig.badge;
    note.sound = msgConfig.sound;
    note.alert = msgConfig.alertMsg;
    note.payload = {
        'messageFrom': 'This is payload'
    };
    console.log(note);

    apnConnection.pushNotification(note, myDevice);
}
