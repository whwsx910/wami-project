// grab the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var reserveSchema = new Schema({
    created: {
        type: Date,
        default: Date.now
    },
    // resv_time: {
    //   type: String,
    //   default: ""
    // },
    resv_time: {
        type: String
    },
    resv_time_abs: Number,
    name: {
        type: String,
        lowercase: true
    },
    tel: {
        type: String,
        default: ""
    },
    party_size: {
        type: Number,
        default: 1
    },
    start_time: {
        type: Number,
        default: 14
    },
    duration: {
        type: Number,
        default: 1
    }, //how long they want to stay
    status: {
        type: Number,
        default: 1 //1 is pending, 2 is confirmed, 0 is canceled
    },
    room: {
        type: Number,
        default: 0 //0 is in the lobby, other numbers are for each room.
    },
    note: {
        type: String,
        default: "Put your note here"
    },
    UID: String,
    showed_up: {
        type: Boolean,
        default: false
    }
});

// the schema is useless so far
// we need to create a model using i
var Resv = mongoose.model('Resv', reserveSchema);

// make this available to our users in our Node applications
module.exports = Resv;
