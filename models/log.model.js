const  mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  userId: String,
  action: String,
  targetId: String, // fiche ou acte
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Log", logSchema);