const Furina = require("../index.js");
const { connect } = require("mongoose");

Furina.once("ready", async() => {
  connect(process.env.mongo)

  
})