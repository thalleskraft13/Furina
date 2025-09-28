const mongoose = require("mongoose")
const CollectorSchema = new mongoose.Schema({
  _id: String,
  fn: String,
  authorId: String,
  expiresAt: Number,
  expired: Boolean,
  timeout: Number
});
module.exports = mongoose.model("Collector", CollectorSchema);