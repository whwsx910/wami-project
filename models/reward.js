// grab the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema
var rewardSchema = new Schema({
  created: {
    type: Date,
    default: Date.now
  },
  expired: Date,
  total: {
    type: Number,
    default: 10
  },
  remaining: Number,
  active: {
    type: Boolean,
    default: true
  },
  winners: []
});

// the schema is useless so far
// we need to create a model using it
var Rewards = mongoose.model('Reward', rewardSchema);

// make this available to our users in our Node applications
module.exports = Rewards;